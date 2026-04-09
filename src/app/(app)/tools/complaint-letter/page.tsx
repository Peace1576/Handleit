import { ToolPage } from '@/components/ToolPage';

export const metadata = { title: 'Complaint Letter — HandleIt' };

export default function ComplaintLetterPage() {
  return (
    <ToolPage tool={{
      id: 'letter',
      color: '#7C3AED',
      glow: 'rgba(124,58,237,0.5)',
      allowFileUpload: true,
    }} />
  );
}
