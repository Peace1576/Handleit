import Anthropic from '@anthropic-ai/sdk';

// Server-only — this file must never be imported in client components
if (typeof window !== 'undefined') {
  throw new Error('anthropic.ts must only be used server-side');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
