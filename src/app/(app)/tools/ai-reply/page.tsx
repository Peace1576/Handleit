import { ToolPage } from '@/components/ToolPage';

export const metadata = { title: 'AI Reply — HandleIt' };

export default function AIReplyPage() {
  return (
    <ToolPage tool={{
      id: 'reply',
      name: 'AI Reply',
      desc: 'Paste any stressful message. Get Assertive, Diplomatic, and Brief reply options instantly.',
      color: '#059669',
      glow: 'rgba(5,150,105,0.5)',
      placeholder: 'Paste the message you need to reply to…\n\nExample: "You missed the deadline again. This is unacceptable."',
    }} />
  );
}
