'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Plan } from '@/types';

interface UsageData {
  plan: Plan;
  uses_remaining: number;
}

export function useUsage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/user/usage');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...data, loading, refresh };
}
