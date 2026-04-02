import { ToolPage } from '@/components/ToolPage';

export const metadata = { title: 'Form Explainer — HandleIt' };

export default function FormExplainerPage() {
  return (
    <ToolPage tool={{
      id: 'form',
      name: 'Form Explainer',
      desc: 'Upload or paste any confusing government, tax, legal, or insurance form. Get every field explained clearly.',
      color: '#1A56DB',
      glow: 'rgba(26,86,219,0.5)',
      placeholder: 'Or paste your form text here…\n\nExample: Box 14 on my W-2 says "NY SDI $31.20" — what does this mean?',
      allowFileUpload: true,
    }} />
  );
}
