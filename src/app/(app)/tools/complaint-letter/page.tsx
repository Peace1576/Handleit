import { ToolPage } from '@/components/ToolPage';

export const metadata = { title: 'Complaint Letter — HandleIt' };

export default function ComplaintLetterPage() {
  return (
    <ToolPage tool={{
      id: 'letter',
      name: 'Complaint Letter',
      desc: 'Describe your bad experience. Get a powerful complaint letter ready to send in seconds.',
      color: '#7C3AED',
      glow: 'rgba(124,58,237,0.5)',
      placeholder: 'Describe your situation…\n\nExample: My flight with Delta was cancelled with no notice and they refused to refund me $340.',
      companyTypes: ['Airline', 'Insurance', 'Landlord', 'Bank', 'Amazon/Retailer', 'Hospital', 'Other'],
      allowFileUpload: true,
    }} />
  );
}
