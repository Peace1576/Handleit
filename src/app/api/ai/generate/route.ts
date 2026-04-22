import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, createServiceRoleClient } from '@/lib/supabase/server';
import Groq from 'groq-sdk';
import { parseComplaintDraft } from '@/lib/complaintLetter';
import { hasFullAccessOverride } from '@/lib/entitlements';
import { isMeteredPlan } from '@/lib/plans';
import { getPrompt } from '@/lib/prompts';
import { rateLimit } from '@/lib/ratelimit';
import type { ComplaintDraft, ToolId } from '@/types';

const VALID_TOOLS: ToolId[] = ['form', 'letter', 'reply'];
const VALID_LANGUAGES = ['en', 'es', 'fr', 'pt', 'de', 'zh', 'ar', 'hi'];
const VALID_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const MAX_INPUT_LENGTH = 8000;
const MAX_FILE_B64_LENGTH = 28_000_000;

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rl = await rateLimit(req, 'ai', user.id);
  if (!rl.success) return rl.response!;

  let tool_id: ToolId;
  let input_text: string;
  let company_type: string | undefined;
  let file_data: string | undefined;
  let file_mime_type: string | undefined;
  let language: string | undefined;

  try {
    const body = await req.json();
    tool_id = body.tool_id;
    input_text = String(body.input_text ?? '').trim().slice(0, MAX_INPUT_LENGTH);
    company_type = body.company_type
      ? String(body.company_type).replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 50)
      : undefined;
    file_data = body.file_data;
    file_mime_type = body.file_mime_type;
    language = body.language;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!VALID_TOOLS.includes(tool_id)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!input_text && !file_data) {
    return NextResponse.json({ error: 'Provide text or upload a file' }, { status: 400 });
  }

  if (file_mime_type && !VALID_MIME_TYPES.includes(file_mime_type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  if (file_data && file_data.length > MAX_FILE_B64_LENGTH) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  if (language && !VALID_LANGUAGES.includes(language)) {
    language = 'en';
  }

  const adminSupabase = createServiceRoleClient();

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

  const hasFullAccess = hasFullAccessOverride(user.email);
  const isMeteredUser = !hasFullAccess && isMeteredPlan(profile.plan);

  if (isMeteredUser && profile.uses_remaining <= 0) {
    return NextResponse.json({ error: 'upgrade_required' }, { status: 402 });
  }

  const systemPrompt = getPrompt(tool_id);
  const userContent = tool_id === 'letter' && company_type
    ? `Company/organization type: ${company_type}\n\nSituation: ${input_text}`
    : input_text;

  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    pt: 'Portuguese (Brazilian)',
    de: 'German',
    zh: 'Simplified Chinese',
    ar: 'Arabic',
    hi: 'Hindi',
  };
  const targetLanguage = languageNames[language ?? 'en'] ?? 'English';
  const fullSystemPrompt = language && language !== 'en'
    ? tool_id === 'letter'
      ? `${systemPrompt}\n\nIMPORTANT: The metadata labels (COMPANY_NAME, RECIPIENT_NAME, RECIPIENT_EMAIL, RECIPIENT_ROLE, SUBJECT, BODY_START, BODY_END) must remain exactly in English. Only the SUBJECT value and the BODY content should be written in ${targetLanguage}.`
      : `${systemPrompt}\n\nIMPORTANT: You MUST respond entirely in ${targetLanguage}. All explanations, headings, and text must be in ${targetLanguage}.`
    : systemPrompt;

  let result_text: string;
  let complaint_draft: ComplaintDraft | null = null;

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let userMessage: any;
    let model = 'llama-3.3-70b-versatile';

    const hasImage = !!file_data && !!file_mime_type && file_mime_type.startsWith('image/');
    const hasPdf = !!file_data && file_mime_type === 'application/pdf';
    const hasDocx = !!file_data && file_mime_type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const hasTxt = !!file_data && file_mime_type === 'text/plain';

    if (hasImage) {
      model = 'meta-llama/llama-4-scout-17b-16e-instruct';
      userMessage = {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${file_mime_type};base64,${file_data}` } },
          { type: 'text', text: userContent || 'Please explain the content of this document.' },
        ],
      };
    } else if (hasPdf) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const buffer = Buffer.from(file_data!, 'base64');
      const parsed = await pdfParse(buffer);
      const extractedText = parsed.text?.trim();

      if (!extractedText) {
        return NextResponse.json({ error: 'Could not extract text from this PDF. Try uploading a photo of the document instead.' }, { status: 400 });
      }

      userMessage = {
        role: 'user',
        content: userContent
          ? `${userContent}\n\n--- Document content ---\n${extractedText}`
          : `--- Document content ---\n${extractedText}`,
      };
    } else if (hasDocx) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth');
      const buffer = Buffer.from(file_data!, 'base64');
      const { value: extractedText } = await mammoth.extractRawText({ buffer });

      if (!extractedText?.trim()) {
        return NextResponse.json({ error: 'Could not extract text from this Word document.' }, { status: 400 });
      }

      userMessage = {
        role: 'user',
        content: userContent
          ? `${userContent}\n\n--- Document content ---\n${extractedText}`
          : `--- Document content ---\n${extractedText}`,
      };
    } else if (hasTxt) {
      const decoded = Buffer.from(file_data!, 'base64').toString('utf-8');
      userMessage = {
        role: 'user',
        content: userContent
          ? `${userContent}\n\n--- Document content ---\n${decoded}`
          : `--- Document content ---\n${decoded}`,
      };
    } else {
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

    const rawResult = completion.choices[0]?.message?.content ?? '';
    if (tool_id === 'letter') {
      complaint_draft = parseComplaintDraft(rawResult);
      result_text = complaint_draft.body;
    } else {
      result_text = rawResult;
    }
  } catch (err) {
    console.error('AI error:', err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: 'AI service temporarily unavailable. Please try again in a moment.' }, { status: 503 });
  }

  if (isMeteredUser) {
    const { data: decrementedProfile, error: decrementError } = await adminSupabase
      .from('profiles')
      .update({
        uses_remaining: profile.uses_remaining - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('plan', profile.plan)
      .eq('uses_remaining', profile.uses_remaining)
      .select('uses_remaining')
      .maybeSingle();

    if (decrementError) {
      console.error('Usage decrement error:', decrementError.message);
      return NextResponse.json({ error: 'Could not update usage. Please try again.' }, { status: 500 });
    }

    if (!decrementedProfile) {
      return NextResponse.json({ error: 'upgrade_required' }, { status: 402 });
    }
  }

  await Promise.all([
    adminSupabase.from('usage_logs').insert({ user_id: user.id, tool_id }).then(),
    adminSupabase.from('saved_results').insert({ user_id: user.id, tool_id, input_text, result_text }).then(),
  ]);

  return NextResponse.json({ result: result_text, complaint_draft });
}
