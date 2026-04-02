import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';
import { getPrompt } from '@/lib/prompts';
import { rateLimit } from '@/lib/ratelimit';
import type { ToolId } from '@/types';

const VALID_TOOLS: ToolId[] = ['form', 'letter', 'reply'];

export async function POST(req: NextRequest) {
  // 0. Rate limit — 20 AI requests per minute per IP
  const rl = await rateLimit(req, 'ai');
  if (!rl.success) return rl.response!;

  // 1. Authenticate
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse + validate body
  const MAX_INPUT_LENGTH = 8000;    // ~6,000 words — enough for any form
  const MAX_FILE_B64_LENGTH = 28_000_000; // ~20 MB base64
  const VALID_LANGUAGES = ['en', 'es', 'fr', 'pt', 'de', 'zh', 'ar', 'hi'];
  const VALID_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];

  let tool_id: ToolId, input_text: string, company_type: string | undefined;
  let file_data: string | undefined, file_mime_type: string | undefined;
  let language: string | undefined;
  try {
    const body = await req.json();
    tool_id = body.tool_id;
    input_text = String(body.input_text ?? '').trim().slice(0, MAX_INPUT_LENGTH);
    // Sanitize company_type — alphanumeric + spaces only, max 50 chars
    company_type = body.company_type ? String(body.company_type).replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 50) : undefined;
    file_data = body.file_data;
    file_mime_type = body.file_mime_type;
    language = body.language;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!VALID_TOOLS.includes(tool_id)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  // Require at least text OR a file
  if (!input_text && !file_data) {
    return NextResponse.json({ error: 'Provide text or upload a file' }, { status: 400 });
  }
  // Validate file MIME type against allowlist
  if (file_mime_type && !VALID_MIME_TYPES.includes(file_mime_type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }
  // Reject oversized file uploads
  if (file_data && file_data.length > MAX_FILE_B64_LENGTH) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }
  // Validate language — only allow known codes
  if (language && !VALID_LANGUAGES.includes(language)) {
    language = 'en';
  }

  // 3. Check usage — service role bypasses RLS
  const adminSupabase = createServiceRoleClient();

  // Upsert profile — self-healing if DB trigger didn't create it on signup
  await adminSupabase.from('profiles').upsert(
    { user_id: user.id },
    { onConflict: 'user_id', ignoreDuplicates: true }
  );

  const { data: profile, error: profileError } = await adminSupabase
    .from('profiles')
    .select('plan, uses_remaining')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  if (profile.plan === 'free' && profile.uses_remaining <= 0) {
    return NextResponse.json({ error: 'upgrade_required' }, { status: 402 });
  }

  // 4. Build prompt
  const systemPrompt = getPrompt(tool_id);
  const userContent = tool_id === 'letter' && company_type
    ? `Company/organization type: ${company_type}\n\nSituation: ${input_text}`
    : input_text;

  const languageNames: Record<string, string> = {
    en: 'English', es: 'Spanish', fr: 'French', pt: 'Portuguese (Brazilian)',
    de: 'German', zh: 'Simplified Chinese', ar: 'Arabic', hi: 'Hindi',
  };
  const targetLanguage = languageNames[language ?? 'en'] ?? 'English';
  const fullSystemPrompt = language && language !== 'en'
    ? `${systemPrompt}\n\nIMPORTANT: You MUST respond entirely in ${targetLanguage}. All explanations, headings, and text must be in ${targetLanguage}.`
    : systemPrompt;

  // 5. Call Groq — vision model for images, text extraction for PDFs/docs
  let result_text: string;
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userMessage: any;
    let model = 'llama-3.3-70b-versatile';

    const hasImage = !!file_data && !!file_mime_type && file_mime_type.startsWith('image/');
    const hasPdf   = !!file_data && file_mime_type === 'application/pdf';
    const hasDocx  = !!file_data && (
      file_mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file_mime_type === 'application/msword'
    );
    const hasTxt   = !!file_data && file_mime_type === 'text/plain';

    if (hasImage) {
      // Vision model for images
      model = 'meta-llama/llama-4-scout-17b-16e-instruct';
      userMessage = {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${file_mime_type};base64,${file_data}` } },
          { type: 'text', text: userContent || 'Please explain the content of this document.' },
        ],
      };

    } else if (hasPdf) {
      // Extract text from PDF using pdf-parse
      // Use require path that avoids pdf-parse's test file loader in Next.js
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const buffer = Buffer.from(file_data!, 'base64');
      const parsed = await pdfParse(buffer);
      const extractedText = parsed.text?.trim();
      if (!extractedText) {
        return NextResponse.json({ error: 'Could not extract text from this PDF. Try uploading a photo of the document instead.' }, { status: 400 });
      }
      const combined = userContent
        ? `${userContent}\n\n--- Document content ---\n${extractedText}`
        : `--- Document content ---\n${extractedText}`;
      userMessage = { role: 'user', content: combined };

    } else if (hasDocx) {
      // Extract text from Word doc using mammoth
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth');
      const buffer = Buffer.from(file_data!, 'base64');
      const { value: extractedText } = await mammoth.extractRawText({ buffer });
      if (!extractedText?.trim()) {
        return NextResponse.json({ error: 'Could not extract text from this Word document.' }, { status: 400 });
      }
      const combined = userContent
        ? `${userContent}\n\n--- Document content ---\n${extractedText}`
        : `--- Document content ---\n${extractedText}`;
      userMessage = { role: 'user', content: combined };

    } else if (hasTxt) {
      // Plain text file — decode directly
      const decoded = Buffer.from(file_data!, 'base64').toString('utf-8');
      const combined = userContent
        ? `${userContent}\n\n--- Document content ---\n${decoded}`
        : `--- Document content ---\n${decoded}`;
      userMessage = { role: 'user', content: combined };

    } else {
      // No file — plain text input
      userMessage = { role: 'user', content: userContent };
    }

    const completion = await groq.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: fullSystemPrompt },
        userMessage,
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    result_text = completion.choices[0]?.message?.content ?? '';
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('AI error:', message);
    return NextResponse.json({ error: message }, { status: 503 });
  }

  // 6. Log usage, save result, decrement free uses — all in parallel
  await Promise.all([
    adminSupabase.from('usage_logs').insert({ user_id: user.id, tool_id }).then(),
    adminSupabase.from('saved_results').insert({ user_id: user.id, tool_id, input_text, result_text }).then(),
    ...(profile.plan === 'free'
      ? [adminSupabase.from('profiles').update({ uses_remaining: profile.uses_remaining - 1, updated_at: new Date().toISOString() }).eq('user_id', user.id).then()]
      : []),
  ]);

  return NextResponse.json({ result: result_text });
}
