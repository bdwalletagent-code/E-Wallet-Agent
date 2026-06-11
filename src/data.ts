export const TRANSLATIONS = {
  English: {
    dashboard: "Dashboard",
    transactions: "Transactions",
    earnings: "Earnings",
    customers: "Customers",
    profile: "Profile",
    adminPanel: "Admin Panel",
    walletBalance: "Wallet Balance",
    todayTxCount: "Today's Transactions",
    todayEarnings: "Today's Earnings",
    monthlyEarnings: "Monthly Earnings",
    totalEarnings: "Total Earnings",
    recentTx: "Recent Transactions",
    cashIn: "Cash In (Deposit)",
    cashOut: "Cash Out (Withdrawal)",
    recharge: "Mobile Recharge",
    billPay: "Bill Payment",
    mobileNumber: "Customer Mobile Number",
    amount: "Amount (BDT)",
    confirm: "Confirm Transaction",
    selectOperator: "Select Mobile Operator",
    prepaid: "Prepaid",
    postpaid: "Postpaid",
    selectBillType: "Select Bill Type",
    billNumber: "Bill Account Number",
    addCustomer: "Add Customer",
    customerProfile: "Customer Profile",
    commissionRate: "Commission Rates",
    agentStatus: "Agent Account Status",
    referAndEarn: "Referral Program",
    pendingApproval: "Pending Approval",
    approved: "Approved",
    suspended: "Suspended",
    execute: "Execute Operation",
    langToggle: "বাংলা",
    notificationTitle: "Notifications",
    agentName: "Agent Name",
    operatorLabel: "Operator",
    billTypeLabel: "Bill Type",
    commission: "Commission",
    payout: "Payout",
    receipt: "Digital Receipt",
    statusText: "Status",
    timestampText: "Date & Time",
    receiptNo: "Receipt No",
    customerName: "Customer Name",
    viewDetails: "View Profile",
    telegramSupport: "Telegram Support",
  },
  Bangla: {
    dashboard: "ড্যাশবোর্ড",
    transactions: "লেনদেন",
    earnings: "আয়সমূহ",
    customers: "গ্রাহকগণ",
    profile: "প্রোফাইল",
    adminPanel: "অ্যাডমিন প্যানেল",
    walletBalance: "ওয়ালেট ব্যালেন্স",
    todayTxCount: "আজকের লেনদেন",
    todayEarnings: "আজকের আয়",
    monthlyEarnings: "মাসিক আয়",
    totalEarnings: "মোট আয়",
    recentTx: "সাম্প্রতিক লেনদেনসমূহ",
    cashIn: "ক্যাশ ইন (ডিপোজিট)",
    cashOut: "ক্যাশ আউট (উইথড্রয়াল)",
    recharge: "মোবাইল রিচার্জ",
    billPay: "বিল পেমেন্ট",
    mobileNumber: "গ্রাহকের মোবাইল নম্বর",
    amount: "পরিমাণ (টাকা)",
    confirm: "লেনদেন নিশ্চিত করুন",
    selectOperator: "মোবাইল অপারেটর নির্বাচন করুন",
    prepaid: "প্রিপেইড",
    postpaid: "পোস্টপেইড",
    selectBillType: "বিলের ধরণ নির্বাচন করুন",
    billNumber: "বিল অ্যাকাউন্ট নম্বর",
    addCustomer: "নতুন গ্রাহক যুক্ত করুন",
    customerProfile: "গ্রাহক প্রোফাইল",
    commissionRate: "কমিশন হার",
    agentStatus: "এজেন্ট অ্যাকাউন্টের অবস্থা",
    referAndEarn: "রেফারাল প্রোগ্রাম",
    pendingApproval: "অনুমোদনের অপেক্ষায়",
    approved: "অনুমোদিত",
    suspended: "স্থগিত",
    execute: "অপারেশন সম্পন্ন করুন",
    langToggle: "English",
    notificationTitle: "বিজ্ঞপ্তি",
    agentName: "এজেন্টের নাম",
    operatorLabel: "অপারেটর",
    billTypeLabel: "বিলের ধরণ",
    commission: "কমিশন",
    payout: "পে-আউট",
    receipt: "ডিজিটাল রসিদ",
    statusText: "অবস্থা",
    timestampText: "তারিখ ও সময়",
    receiptNo: "রসিদ নম্বর",
    customerName: "গ্রাহকের নাম",
    viewDetails: "প্রোফাইল দেখুন",
    telegramSupport: "টেলিগ্রাম সাপোর্ট",
  }
};

export const OPERATORS = [
  { id: "gp", name: "Grameenphone", logo: "🟢" },
  { id: "bl", name: "Banglalink", logo: "🟠" },
  { id: "robi", name: "Robi", logo: "🔴" },
  { id: "airtel", name: "Airtel", logo: "❤️" },
  { id: "teletalk", name: "Teletalk", logo: "🔴" }
];

export const BILLS = [
  { id: "electricity", name: "Electricity Bill (Desco / Nesco)", icon: "⚡" },
  { id: "gas", name: "Gas Bill (Titas)", icon: "🔥" },
  { id: "water", name: "Water Bill (Wasa)", icon: "💧" },
  { id: "internet", name: "Internet Bill (AmberIT / Link3)", icon: "🌐" }
];

export const INITIAL_CUSTOMERS = [
  { id: "cust_1", name: "Md. Kamal Hossain", mobile: "01712345678", registeredByAgentId: "agent_1", createdAt: "2026-05-20T10:30:00Z" },
  { id: "cust_2", name: "Mrs. Rabeya Begum", mobile: "01987654321", registeredByAgentId: "agent_1", createdAt: "2026-05-22T14:15:00Z" },
  { id: "cust_3", name: "Akkas Ali Sheikh", mobile: "01855667788", registeredByAgentId: "agent_1", createdAt: "2026-06-01T09:05:00Z" },
  { id: "cust_4", name: "Nusrat Jahan Mimi", mobile: "01511223344", registeredByAgentId: "agent_1", createdAt: "2026-06-03T18:40:00Z" }
];

export const INITIAL_TRANSACTIONS = [
  {
    id: "tx_1",
    agentId: "agent_1",
    agentName: "Tanveer Rahman",
    customerMobile: "01712345678",
    type: "deposit",
    amount: 5000,
    commissionEarned: 250, // 5%
    status: "success",
    timestamp: "2026-06-08T10:14:00Z",
    receiptNumber: "TXN849102830"
  },
  {
    id: "tx_2",
    agentId: "agent_1",
    agentName: "Tanveer Rahman",
    customerMobile: "01987654321",
    type: "withdrawal",
    amount: 3000,
    commissionEarned: 90, // 3%
    status: "success",
    timestamp: "2026-06-08T13:45:00Z",
    receiptNumber: "TXN284901840"
  },
  {
    id: "tx_3",
    agentId: "agent_1",
    agentName: "Tanveer Rahman",
    customerMobile: "01855667788",
    type: "recharge",
    operator: "Grameenphone",
    amount: 150,
    commissionEarned: 0,
    status: "success",
    timestamp: "2026-06-09T08:20:00Z",
    receiptNumber: "TXN740284719"
  },
  {
    id: "tx_4",
    agentId: "agent_1",
    agentName: "Tanveer Rahman",
    customerMobile: "01511223344",
    type: "bill_pay",
    billType: "Electricity Bill (Desco / Nesco)",
    amount: 1450,
    commissionEarned: 0,
    status: "success",
    timestamp: "2026-06-09T11:10:00Z",
    receiptNumber: "TXN401827495"
  }
];

export const INITIAL_REFERRALS = [
  {
    id: "ref_1",
    referrerAgentId: "agent_1",
    referrerAgentName: "Tanveer Rahman",
    referredAgentId: "agent_new_1",
    referredAgentName: "Mahmudul Hasan (Savar)",
    rewardAmount: 500,
    status: "rewarded",
    timestamp: "2026-06-05T12:00:00Z"
  },
  {
    id: "ref_2",
    referrerAgentId: "agent_1",
    referrerAgentName: "Tanveer Rahman",
    referredAgentId: "agent_new_2",
    referredAgentName: "Sharmin Akhter (Sylhet)",
    rewardAmount: 500,
    status: "pending_approval",
    timestamp: "2026-06-08T16:30:00Z"
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "not_1",
    type: "broadcast",
    recipientAgentId: null,
    title: "Ramadan Campaign Bonus 🌙",
    body: "Attention Agents! Earn an extra 1% bonus on cash-in amounts exceeding 10,000 BDT throughout this weekend. Happy transacting!",
    timestamp: "2026-06-08T09:00:00Z",
    read: false
  },
  {
    id: "not_2",
    type: "individual",
    recipientAgentId: "agent_1",
    title: "Commission Disbursed 💰",
    body: "Your daily agent commission of 340.00 BDT for 2026-06-08 has been securely auto-funded into your primary agent wallet.",
    timestamp: "2026-06-08T23:59:00Z",
    read: true
  },
  {
    id: "not_3",
    type: "broadcast",
    recipientAgentId: null,
    title: "System Update: Secured Node Upgrade 🔒",
    body: "We have fully upgraded our core database servers to enhance transaction speeds. Security rules are strictly reinforced. All endpoints remain online.",
    timestamp: "2026-06-09T02:00:00Z",
    read: false
  }
];
