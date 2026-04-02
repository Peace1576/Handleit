'use client';

import { useState } from 'react';
import type { ToolId } from '@/types';

interface GenerateParams {
  tool_id: ToolId;
  input_text: string;
  company_type?: string;
  file_data?: string;        // base64-encoded file content
  file_mime_type?: string;   // e.g. 'application/pdf' or 'image/jpeg'
}

export function useAI(onUpgradeRequired?: () => void) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async ({ tool_id, input_text, company_type, file_data, file_mime_type }: GenerateParams) => {
    setLoading(true);
    setResult(null);
    setError(null);

    const language = localStorage.getItem('handleit_language') ?? 'en';

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
        setError(data.error ?? 'Something went wrong. Try again.');
        return;
      }

      const data = await res.json();
      setResult(data.result);
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setError(null); };

  return { generate, result, loading, error, reset };
}
