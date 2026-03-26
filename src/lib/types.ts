export type RoleView = "lead" | "worker";
export type TeamMemberRole = "owner" | "manager" | "member";
export type MembershipStatus = "active" | "invited" | "suspended" | "left";
export type PayoutMode = "instant" | "scheduled";
export type PayoutFrequency = "daily" | "weekly" | "biweekly" | "monthly";
export type AssignmentMode = "assigned" | "open_claim";
export type TaskStatus = "open" | "assigned" | "submitted" | "approved" | "paid" | "cancelled";
export type CollectionStatus = "pending" | "verifying" | "successful" | "failed" | "cancelled";
export type PayoutStatus = "pending" | "processing" | "successful" | "failed" | "cancelled";
export type EarningStatus = "pending" | "processing" | "paid" | "failed" | "cancelled";
export type ChatRoomType = "team" | "direct" | "task";

export interface Profile {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  default_role_view: RoleView;
  payout_ready: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PayoutMethod {
  id: string;
  user_id: string;
  bank_code: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  is_verified: boolean;
  verified_at: string | null;
  verification_message: string | null;
  provider_metadata: Record<string, unknown> | null;
}

export interface Team {
  id: string;
  name: string;
  invite_code: string;
  owner_user_id: string;
  payout_mode: PayoutMode;
  payout_frequency: PayoutFrequency | null;
  threshold_minor: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface TeamWallet {
  team_id: string;
  available_balance_minor: number;
  reserved_balance_minor: number;
  pending_payout_balance_minor: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamMemberRole;
  status: MembershipStatus;
  joined_at: string;
  profile?: Profile;
}

export interface Task {
  id: string;
  team_id: string;
  created_by_user_id: string;
  assignment_mode: AssignmentMode;
  title: string;
  description: string;
  reward_minor: number;
  deadline_at: string | null;
  status: TaskStatus;
  assignee_user_id: string | null;
  claimed_by_user_id: string | null;
  claimed_at: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  assignee?: Profile | null;
  claimed_by?: Profile | null;
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  submitted_by_user_id: string;
  note: string | null;
  evidence: Array<{ path: string; name: string; mimeType: string; size: number }>;
  status: "submitted" | "approved" | "rejected";
  rejection_reason: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  created_at: string;
  submitted_by?: Profile | null;
}

export interface WorkerEarning {
  id: string;
  team_id: string;
  task_id: string;
  worker_user_id: string;
  amount_minor: number;
  status: EarningStatus;
  payout_id: string | null;
  approved_at: string;
  paid_at: string | null;
}

export interface PaymentCollection {
  id: string;
  team_id: string;
  initiated_by_user_id: string;
  txn_ref: string;
  amount_minor: number;
  status: CollectionStatus;
  provider_reference: string | null;
  provider_payment_id: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Payout {
  id: string;
  team_id: string;
  worker_user_id: string;
  initiated_by_user_id: string;
  transaction_reference: string;
  amount_minor: number;
  fee_minor: number | null;
  status: PayoutStatus;
  recipient_bank_code: string;
  recipient_bank_name: string;
  recipient_account_number: string;
  recipient_account_name: string;
  narration: string;
  provider_payload: Record<string, unknown> | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  team_id: string | null;
  task_id: string | null;
  type: string;
  title: string;
  body: string;
  read_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  team_id: string | null;
  task_id: string | null;
  type: ChatRoomType;
  name: string;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_user_id: string;
  content: string;
  attachments: Array<{ path: string; name: string; mimeType: string; size: number }>;
  created_at: string;
  sender?: Profile | null;
}
