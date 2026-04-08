export type Plan = 'free' | 'basic' | 'pro' | 'lifetime';
export type ToolId = 'form' | 'letter' | 'reply';

export interface ComplaintDraft {
  companyName: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  recipientRole: string | null;
  subject: string;
  body: string;
}

export interface GeneratedResult {
  text: string;
  complaintDraft?: ComplaintDraft | null;
}

export interface Profile {
  id: string;
  user_id: string;
  plan: Plan;
  uses_remaining: number;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  user_id: string;
  tool_id: ToolId;
  created_at: string;
}

export interface SavedResult {
  id: string;
  user_id: string;
  tool_id: ToolId;
  input_text: string;
  result_text: string;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  status: string;
  plan: 'pro' | 'lifetime';
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export type PaddlePlan = 'basic_monthly' | 'basic_annual' | 'pro_monthly' | 'pro_annual' | 'lifetime';
