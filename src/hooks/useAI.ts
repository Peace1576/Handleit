'use client';

import { useCallback, useState } from 'react';
import { getAppTranslations } from '@/lib/appTranslations';
import type { GeneratedResult, ToolId } from '@/types';

interface GenerateParams {
  tool_id: ToolId;
  input_text: string;
  company_type?: string;
  file_data?: string;        // base64-encoded file content
  file_mime_type?: string;   // e.g. 'application/pdf' or 'image/jpeg'
}

export function useAI(onUpgradeRequired?: () => void) {
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async ({ tool_id, input_text, company_type, file_data, file_mime_type }: GenerateParams) => {
    setLoading(true);
    setResult(null);
    setError(null);

    const language = localStorage.getItem('handleit_language') ?? 'en';
    const t = getAppTranslations(language);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool_id, input_text, company_type, file_data, file_mime_type, language }),
      });

      if (res.status === 402) {
        onUpgradeRequired?.();
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? t.loginPage.errors.invalidDetails);
        return;
      }

      const data = await res.json();
      setResult({
        text: data.result,
        complaintDraft: data.complaint_draft ?? null,
      });
    } catch {
      setError(t.connectionError);
    } finally {
      setLoading(false);
    }
  }, [onUpgradeRequired]);

  const hydrate = (value: GeneratedResult | null) => {
    setResult(value);
    setError(null);
  };

  const reset = useCallback(() => { setResult(null); setError(null); }, []);

  return { generate, result, loading, error, reset, hydrate: useCallback(hydrate, []) };
}
