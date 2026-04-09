import { ToolPage } from '@/components/ToolPage';

export const metadata = { title: 'AI Reply — HandleIt' };

export default function AIReplyPage() {
  return (
    <ToolPage tool={{
      id: 'reply',
      color: '#059669',
      glow: 'rgba(5,150,105,0.5)',
    }} />
  );
}
