export type UserRole = "agent" | "admin";
export type AgentStatus = "pending" | "approved" | "suspended";
export type TransactionType = "deposit" | "withdrawal" | "recharge" | "bill_pay" | "agent_cash" | "agent_withdraw" | "help_desk";
export type Language = "English" | "Bangla";
export type MainTab = "dashboard" | "transactions" | "earnings" | "customers" | "profile" | "admin";

export interface AgentCashRequest {
  id: string;
  agentId: string;
  agentName: string;
  method: "bKash" | "Nagad";
  amount: number;
  usdAmount: number;
  senderNumber: string;
  transactionId: string;
  screenshotUrl?: string; // mock path or base64
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Agent {
  agentId: string;
  name: string;
  mobile: string;
  status: AgentStatus;
  walletBalance: number;
  commissionBalance: number;
  referredBy: string | null;
  referralCode: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  registeredByAgentId: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  agentId: string;
  agentName: string;
  customerMobile: string;
  type: TransactionType;
  operator?: string;   // For mobile recharge
  billType?: string;   // For bill payment
  amount: number;
  commissionEarned: number;
  status: "pending" | "success" | "failed";
  timestamp: string;
  receiptNumber: string;
}

export interface Referral {
  id: string;
  referrerAgentId: string;
  referrerAgentName: string;
  referredAgentId: string;
  referredAgentName: string;
  rewardAmount: number;
  status: "pending_approval" | "rewarded";
  timestamp: string;
}

export interface Notification {
  id: string;
  type: "broadcast" | "individual";
  recipientAgentId: string | null;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
}

export interface WalletStats {
  balance: number;
  todayTransactionsCount: number;
  todayTransactionsAmount: number;
  todayEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
}
