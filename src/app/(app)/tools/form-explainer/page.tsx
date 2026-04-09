import { ToolPage } from '@/components/ToolPage';

export const metadata = { title: 'Form Explainer — HandleIt' };

export default function FormExplainerPage() {
  return (
    <ToolPage tool={{
      id: 'form',
      color: '#1A56DB',
      glow: 'rgba(26,86,219,0.5)',
      allowFileUpload: true,
    }} />
  );
}
