'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type GoogleAdsPageViewProps = {
  tagId?: string;
};

export function GoogleAdsPageView({ tagId }: GoogleAdsPageViewProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!tagId || typeof window.gtag !== 'function') {
      return;
    }

    window.gtag('config', tagId, {
      page_path: pathname,
    });
  }, [pathname, tagId]);

  return null;
}
