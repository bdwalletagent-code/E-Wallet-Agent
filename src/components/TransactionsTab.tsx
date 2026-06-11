import React, { useState, useMemo, useEffect } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  PhoneCall, 
  FileText, 
  Search, 
  Filter, 
  Share2, 
  CheckCircle2, 
  HelpCircle,
  X,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  CreditCard,
  Landmark,
  BookOpen,
  Send,
  Upload,
  Trophy,
  Users
} from "lucide-react";
import { Transaction, TransactionType, Agent, Language, AgentCashRequest } from "../types";
import { TRANSLATIONS, OPERATORS, BILLS } from "../data";

interface TransactionsTabProps {
  agent: Agent;
  transactions: Transaction[];
  agentCashRequests?: AgentCashRequest[];
  lang: Language;
  onExecuteTransaction: (tx: {
    customerMobile: string;
    type: TransactionType;
    amount: number;
    operator?: string;
    billType?: string;
  }) => { success: boolean; error?: string; receipt?: Transaction };
  onApproveTransaction?: (txId: string) => { success: boolean; error?: string };
  onRejectTransaction?: (txId: string) => { success: boolean; error?: string };
  onSimulatePlayerRequest?: (type: "deposit" | "withdrawal") => void;
  onExecuteRequestAgentCash?: (method: "bKash" | "Nagad", amount: number, senderNumber: string, transactionId: string, screenshotUrl?: string) => { success: boolean; error?: string };
  isDark: boolean;
  preSelectedOp?: TransactionType;
  onClearPreselection?: () => void;
  globalPoolDeposits?: number;
  globalPoolWithdrawals?: number;
}

export default function TransactionsTab({
  agent,
  transactions,
  agentCashRequests = [],
  lang,
  onExecuteTransaction,
  onApproveTransaction,
  onRejectTransaction,
  onSimulatePlayerRequest,
  onExecuteRequestAgentCash,
  isDark,
  preSelectedOp,
  onClearPreselection,
  globalPoolDeposits = 200,
  globalPoolWithdrawals = 200
}: TransactionsTabProps) {
  const t = TRANSLATIONS[lang];
  const [activeForm, setActiveForm] = useState<TransactionType>(preSelectedOp || "deposit");
  
  // Track tabs when preset changes
  useEffect(() => {
    if (preSelectedOp) {
      setActiveForm(preSelectedOp);
      if (onClearPreselection) onClearPreselection();
    }
  }, [preSelectedOp]);

  // General Transaction Form States
  const [mobile, setMobile] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("Grameenphone");
  const [rechargeStyle, setRechargeStyle] = useState<"Prepaid" | "Postpaid">("Prepaid");
  const [selectedBill, setSelectedBill] = useState("Electricity Bill (Desco / Nesco)");
  const [billNo, setBillNo] = useState("");

  // Agent Cash Form States
  const [cashMethod, setCashMethod] = useState<"bKash" | "Nagad">("bKash");
  const [cashAmount, setCashAmount] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [mockFileName, setMockFileName] = useState<string | null>(null);
  const [cashSuccessMsg, setCashSuccessMsg] = useState<string | null>(null);

  // Agent Withdraw Form States
  const [withdrawSource, setWithdrawSource] = useState<"wallet" | "commission">("commission");
  const [withdrawMethod, setWithdrawMethod] = useState<"bKash" | "Nagad">("bKash");
  const [withdrawMobile, setWithdrawMobile] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);

  // History Ledger filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");

  // Receipt popup active simulation item
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Live Commission display logic
  const liveCommission = useMemo(() => {
    const amt = parseFloat(amount) || 0;
    if (activeForm === "deposit") return amt * 0.05;
    if (activeForm === "withdrawal") return amt * 0.03;
    return 0;
  }, [amount, activeForm]);

  // Handle player deposit/withdrawal submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);

    if (agent.status !== "approved") {
      setErrorText("Transaction Blocked: Your Agent profile status is currently " + agent.status.toUpperCase() + ". Please consult Admin approval panel.");
      return;
    }

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setErrorText("Input Error: Please specify a valid positive amount in BDT.");
      return;
    }

    if (mobile.length < 11 || !/^\d+$/.test(mobile)) {
      setErrorText("Input Error: Customer mobile number must be at least 11 digits.");
      return;
    }

    if (activeForm === "bill_pay" && !billNo) {
      setErrorText("Input Error: Please enter unique reference utility bill number.");
      return;
    }

    // Checking balance bounds
    if (activeForm === "deposit" || activeForm === "recharge" || activeForm === "bill_pay") {
      if (agent.walletBalance < amt) {
        setErrorText(`Insufficient Balance: You need ${amt} BDT in your Wallet Balance to finish this request.`);
        return;
      }
    }

    // Submit transaction
    const result = onExecuteTransaction({
      customerMobile: mobile,
      type: activeForm,
      amount: amt,
      operator: activeForm === "recharge" ? selectedOperator : undefined,
      billType: activeForm === "bill_pay" ? selectedBill : undefined
    });

    if (result.success && result.receipt) {
      setReceipt(result.receipt);
      // Reset form variables
      setAmount("");
      setMobile("");
      setBillNo("");
    } else {
      setErrorText(result.error || "Internal Error transaction failed");
    }
  };

  // Submit agent balance load request (Agent Cash)
  const handleAgentCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setCashSuccessMsg(null);

    const amt = parseFloat(cashAmount);
    if (isNaN(amt) || amt < 1200) {
      setErrorText("Validation Error: Minimum BDT amount to top up is 1,200 BDT (equivalent to $10).");
      return;
    }

    if (senderNumber.length < 11 || !/^\d+$/.test(senderNumber)) {
      setErrorText("Validation Error: Please provide a valid Bkash or Nagad wallet sender mobile.");
      return;
    }

    if (!transactionId.trim()) {
      setErrorText("Validation Error: Transaction ID check is required for manual matching.");
      return;
    }

    if (onExecuteRequestAgentCash) {
      const result = onExecuteRequestAgentCash(cashMethod, amt, senderNumber, transactionId);
      if (result.success) {
        setCashSuccessMsg(`Deposit request submitted successfully! Super Admin will verify Transaction ID '${transactionId}' and approve BDT ${amt} BDT to your wallet.`);
        setCashAmount("");
        setSenderNumber("");
        setTransactionId("");
        setMockFileName(null);
      } else {
        setErrorText(result.error || "Could not submit balance load request.");
      }
    }
  };

  // Submit agent withdrawal request (Agent Withdraw)
  const handleAgentWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setWithdrawSuccessMsg(null);

    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      setErrorText("Validation Error: Please insert a valid withdrawal amount.");
      return;
    }

    if (withdrawSource === "commission" && agent.commissionBalance < amt) {
      setErrorText(`Insufficient Funds: Your Commission Balance is ${agent.commissionBalance} BDT, which is less than requested.`);
      return;
    }

    if (withdrawSource === "wallet" && agent.walletBalance < amt) {
      setErrorText(`Insufficient Funds: Your Wallet Balance is ${agent.walletBalance} BDT, which is less than requested.`);
      return;
    }

    if (withdrawMobile.length < 11 || !/^\d+$/.test(withdrawMobile)) {
      setErrorText("Validation Error: Please provide personal receiver mobile number.");
      return;
    }

    // Withdraw is executed immediately in simulation, debiting the balance
    const result = onExecuteTransaction({
      customerMobile: withdrawMobile,
      type: "agent_withdraw",
      amount: amt
    });

    if (result.success) {
      setWithdrawSuccessMsg(`Withdrawal Completed! BDT ${amt} BDT has been withdrawn from your ${withdrawSource} balance and transferred to ${withdrawMethod} personal address '${withdrawMobile}' successfully.`);
      setWithdrawAmount("");
      setWithdrawMobile("");
    } else {
      setErrorText(result.error || "Could not complete balance withdrawal.");
    }
  };

  // Live filtered transactions list for general ledger
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.customerMobile.includes(searchQuery) || tx.receiptNumber.includes(searchQuery);
      const matchesType = typeFilter === "all" || tx.type === typeFilter;
      return matchesSearch && matchesType;
    }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, searchQuery, typeFilter]);

  // Derived Statistics for Deposits/Withdrawals
  const txStats = useMemo(() => {
    const list = transactions.filter(t => t.type === activeForm);
    const total = list.length;
    const approved = list.filter(t => t.status === "success").length;
    const cancelled = list.filter(t => t.status === "failed").length;
    const pending = list.filter(t => t.status === "pending").length;

    return { total, approved, cancelled, pending, list };
  }, [transactions, activeForm]);

  // File Upload drag-and-drop simulation
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setMockFileName(e.dataTransfer.files[0].name);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      
      {/* Scrollable Category selector Tabs for operations */}
      <div className={`p-3 shrink-0 flex gap-1.5 overflow-x-auto scrollbar-none border-b ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
        {(["deposit", "withdrawal", "recharge", "bill_pay", "agent_cash", "agent_withdraw", "help_desk"] as TransactionType[]).map((type) => (
          <button
            key={type}
            id={`op-tab-toggle-${type}`}
            onClick={() => {
              setActiveForm(type);
              setErrorText(null);
              setCashSuccessMsg(null);
              setWithdrawSuccessMsg(null);
            }}
            className={`flex-none px-4 py-2 rounded-xl text-[10px] font-bold tracking-tight uppercase transition-all cursor-pointer text-center ${
              activeForm === type 
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/10" 
                : isDark ? "text-slate-400 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {type === "deposit" ? t.cashIn : 
             type === "withdrawal" ? t.cashOut : 
             type === "recharge" ? "Recharge" : 
             type === "bill_pay" ? "Utilities" :
             type === "agent_cash" ? "Agent Cash 🟢" :
             type === "agent_withdraw" ? "Agent Withdraw 💸" : "Help Desk 💡"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 scrollbar-none space-y-5">
        
        {/* Render standard/custom forms based on activeForm state */}
        {activeForm !== "help_desk" && (
          <div className={`mt-4 p-5 rounded-3xl border transition-all ${
            isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"
          }`}>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${
                  activeForm === "deposit" ? "bg-emerald-500/10 text-emerald-500" :
                  activeForm === "withdrawal" ? "bg-blue-500/10 text-blue-500" :
                  activeForm === "recharge" ? "bg-sky-500/10 text-sky-500" :
                  activeForm === "agent_cash" ? "bg-emerald-500/10 text-emerald-500" :
                  activeForm === "agent_withdraw" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
                }`}>
                  {activeForm === "deposit" ? <ArrowUpRight size={16} /> :
                   activeForm === "withdrawal" ? <ArrowDownLeft size={16} /> :
                   activeForm === "recharge" ? <PhoneCall size={16} /> :
                   activeForm === "agent_cash" ? <CreditCard size={16} /> :
                   activeForm === "agent_withdraw" ? <Landmark size={16} /> : <FileText size={16} />}
                </span>
                <span className="font-extrabold text-xs tracking-wider uppercase">
                  {activeForm === "deposit" ? `${t.cashIn} Request` : 
                   activeForm === "withdrawal" ? `${t.cashOut} Request` : 
                   activeForm === "recharge" ? t.recharge : 
                   activeForm === "bill_pay" ? t.billPay :
                   activeForm === "agent_cash" ? "Load Agent Wallet Cash" : "Agent Payout Withdraw"}
                </span>
              </div>

              {/* Show balance status dynamically if appropriate */}
              {(activeForm === "deposit" || activeForm === "agent_withdraw") && (
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-emerald-500 px-2 py-0.5 rounded cursor-help">
                  Wallet: {agent.walletBalance.toLocaleString()} BDT
                </span>
              )}
              {activeForm === "agent_withdraw" && (
                <span className="text-[10px] font-mono font-bold bg-slate-900 text-teal-400 px-2 py-0.5 rounded ml-1 cursor-help">
                  Comm: {agent.commissionBalance.toLocaleString()} BDT
                </span>
              )}
            </div>

            {errorText && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex gap-2 items-start text-xs text-rose-450 animate-shake">
                <AlertTriangle size={14} className="shrink-0 mt-0.5 text-rose-500" />
                <span>{errorText}</span>
              </div>
            )}

            {cashSuccessMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-2 items-start text-xs text-emerald-300 animate-fade-in">
                <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-500" />
                <span>{cashSuccessMsg}</span>
              </div>
            )}

            {withdrawSuccessMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-2 items-start text-xs text-emerald-300 animate-fade-in">
                <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-500" />
                <span>{withdrawSuccessMsg}</span>
              </div>
            )}

            {/* Standard Forms block */}
            {(activeForm === "deposit" || activeForm === "withdrawal" || activeForm === "recharge" || activeForm === "bill_pay") && (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {activeForm === "recharge" && (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {t.selectOperator}
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {OPERATORS.map((op) => (
                        <button
                          key={op.id}
                          type="button"
                          id={`operator-select-${op.id}`}
                          onClick={() => setSelectedOperator(op.name)}
                          className={`py-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            selectedOperator === op.name
                              ? "border-sky-500 bg-sky-500/10 text-sky-500"
                              : isDark ? "border-slate-800 bg-slate-900 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"
                          }`}
                        >
                          <span className="text-sm">{op.logo}</span>
                          <span className="text-[7px] tracking-tight truncate w-full px-0.5 text-center">{op.name.split(" ")[0]}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-1">
                      {(["Prepaid", "Postpaid"] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          id={`recharge-style-${style}`}
                          onClick={() => setRechargeStyle(style)}
                          className={`flex-1 py-1.5 rounded-lg border text-[10px] font-bold tracking-tight uppercase transition-all cursor-pointer ${
                            rechargeStyle === style
                              ? "border-sky-500 bg-sky-500/10 text-sky-500"
                              : isDark ? "border-slate-850 bg-slate-900 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                        >
                          {style === "Prepaid" ? t.prepaid : t.postpaid}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeForm === "bill_pay" && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t.selectBillType}
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {BILLS.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            id={`bill-pay-select-${b.id}`}
                            onClick={() => setSelectedBill(b.name)}
                            className={`p-2.5 rounded-xl border text-[10px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
                              selectedBill === b.name
                                ? "border-amber-500 bg-amber-500/10 text-amber-500"
                                : isDark ? "border-slate-800 bg-slate-900 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-600"
                            }`}
                          >
                            <span className="text-base">{b.icon}</span>
                            <span className="truncate">{b.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Account/Consumer Bill Reference ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 190283018270"
                        value={billNo}
                        onChange={(e) => setBillNo(e.target.value.replace(/\D/g, ""))}
                        className={`w-full p-2.5 rounded-2xl text-xs font-mono focus:outline-emerald-500 border ${
                          isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-900"
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {activeForm === "recharge" ? "Recipient Mobile (Grameen, Robi, Airtel...)":"Player / Customer Mobile Number"}
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 01711223344"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    maxLength={11}
                    className={`w-full p-2.5 rounded-2xl text-xs font-mono focus:outline-emerald-500 border ${
                      isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Transaction Amount (BDT)
                    </label>
                    {liveCommission > 0 && (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        Commission Earned: +{liveCommission.toLocaleString("en-US", { minimumFractionDigits: 1 })} BDT
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full p-2.5 rounded-2xl text-xs font-mono focus:outline-emerald-500 border ${
                      isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-900"
                    }`}
                  />
                </div>

                <button
                  id="submit-transaction-btn"
                  type="submit"
                  className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer hover:brightness-110 active:scale-98 transition-all text-center ${
                    activeForm === "deposit" ? "bg-emerald-600 text-white shadow-emerald-500/10" :
                    activeForm === "withdrawal" ? "bg-blue-600 text-white shadow-blue-500/10" :
                    activeForm === "recharge" ? "bg-sky-600 text-white shadow-sky-500/10" : "bg-amber-500 text-slate-950 shadow-amber-500/10"
                  }`}
                >
                  {activeForm === "deposit" ? "Submit Deposit Request (Pending)" :
                   activeForm === "withdrawal" ? "Submit Withdrawal Request (Pending)" :
                   activeForm === "recharge" ? t.recharge : t.billPay}
                </button>
              </form>
            )}

            {/* Agent Cash balance loading request Form */}
            {activeForm === "agent_cash" && (
              <form onSubmit={handleAgentCashSubmit} className="space-y-4 animate-fade-in1">
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs leading-relaxed space-y-1">
                  <span className="font-extrabold text-emerald-400 uppercase tracking-widest block text-[9px]">Bkash & Nagad Cash Instructions</span>
                  <p className="text-slate-300">
                    Send at least <span className="font-bold text-white">1,200 BDT</span> ($10 equivalent) using <span className="font-extrabold text-amber-500">Sent Money</span> to our official Merchant Account:
                  </p>
                  <p className="font-mono text-center text-sm font-black text-emerald-500 bg-slate-900 py-1 rounded tracking-widest my-1.5 select-all">
                    +880 1712-345678 (Bkash/Nagad)
                  </p>
                  <p className="text-[10px] text-slate-450">
                    Once sent, complete the form below with the transaction details for authorization verification.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Payment App Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["bKash", "Nagad"] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        id={`cash-method-${method}`}
                        onClick={() => setCashMethod(method)}
                        className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          cashMethod === method 
                            ? "border-emerald-505 bg-emerald-500/15 text-emerald-500" 
                            : "border-slate-800 bg-slate-900 text-slate-400"
                        }`}
                      >
                        {method === "bKash" ? "bKash (বিকাশ)" : "Nagad (নগদ)"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Amount (BDT)</label>
                      {cashAmount && parseFloat(cashAmount) >= 1200 && (
                        <span className="text-[9px] text-emerald-400 font-bold">~ ${(parseFloat(cashAmount)/120).toFixed(1)} USD</span>
                      )}
                    </div>
                    <input
                      type="number"
                      placeholder="Min 1200"
                      value={cashAmount}
                      onChange={(e) => setCashAmount(e.target.value)}
                      className="w-full p-2.5 rounded-2xl text-xs font-mono focus:outline-emerald-500 border bg-slate-900 border-slate-800 text-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Sender Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 017xxxxxxxx"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value.replace(/\D/g, ""))}
                      maxLength={11}
                      className="w-full p-2.5 rounded-2xl text-xs font-mono focus:outline-emerald-500 border bg-slate-900 border-slate-800 text-slate-300"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Transaction ID (TxnID)</label>
                  <input
                    type="text"
                    placeholder="e.g. AM9KK83P7A"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                    className="w-full p-2.5 rounded-2xl text-xs font-mono focus:outline-emerald-500 border bg-slate-900 border-slate-800 text-slate-300"
                  />
                </div>

                {/* Screenshot upload placeholder drag & drop */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Transferred Screenshot Proof</label>
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    className="border-2 border-dashed border-slate-800 rounded-3xl p-4.5 text-center transition-all hover:border-emerald-500/40 bg-slate-900/30 relative cursor-pointer"
                  >
                    <input 
                      type="file" 
                      id="agent-cash-screenshot-file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setMockFileName(e.target.files[0].name);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <Upload size={18} className="mx-auto text-emerald-500 mb-1" />
                    {mockFileName ? (
                      <p className="text-[11px] font-bold text-emerald-400 font-mono italic truncate">{mockFileName}</p>
                    ) : (
                      <>
                        <p className="text-xs font-bold text-slate-300">Drag & Drop transaction screenshot or tap</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">JPEG, PNG files are allowed</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  id="agent-cash-submit-btn"
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 cursor-pointer transition-all text-center"
                >
                  Submit Cash Deposit Proof
                </button>
              </form>
            )}

            {/* Agent Withdraw balance request Form */}
            {activeForm === "agent_withdraw" && (
              <form onSubmit={handleAgentWithdrawSubmit} className="space-y-4 animate-fade-in2">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Source Balance Hub</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id="source-bal-commission"
                      onClick={() => setWithdrawSource("commission")}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        withdrawSource === "commission" 
                          ? "border-teal-400 bg-teal-500/10 text-teal-400" 
                          : "border-slate-800 bg-slate-900 text-slate-400"
                      }`}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Commission Balance</p>
                      <p className="text-sm font-black font-mono mt-0.5">৳{agent.commissionBalance.toLocaleString()}</p>
                    </button>

                    <button
                      type="button"
                      id="source-bal-wallet"
                      onClick={() => setWithdrawSource("wallet")}
                      className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                        withdrawSource === "wallet" 
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" 
                          : "border-slate-800 bg-slate-900 text-slate-400"
                      }`}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Wallet Balance</p>
                      <p className="text-sm font-black font-mono mt-0.5">৳{agent.walletBalance.toLocaleString()}</p>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Withdrawal Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["bKash", "Nagad"] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        id={`withdraw-method-${method}`}
                        onClick={() => setWithdrawMethod(method)}
                        className={`py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                          withdrawMethod === method 
                            ? "border-emerald-500 bg-emerald-500/12 text-emerald-500" 
                            : "border-slate-800 bg-slate-900 text-slate-400"
                        }`}
                      >
                        {method === "bKash" ? "bKash Personal" : "Nagad Personal"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Personal Mobile No</label>
                    <input
                      type="tel"
                      placeholder="e.g. 017xxxxxxxx"
                      value={withdrawMobile}
                      onChange={(e) => setWithdrawMobile(e.target.value.replace(/\D/g, ""))}
                      maxLength={11}
                      className="w-full p-2.5 rounded-2xl text-xs font-mono focus:outline-emerald-500 border bg-slate-900 border-slate-800 text-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Amount (BDT)</label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full p-2.5 rounded-2xl text-xs font-mono focus:outline-emerald-500 border bg-slate-900 border-slate-800 text-slate-300"
                    />
                  </div>
                </div>

                <button
                  id="agent-withdraw-submit-btn"
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 cursor-pointer transition-all text-center"
                >
                  Submit Withdrawal Request
                </button>
              </form>
            )}

          </div>
        )}

        {/* Live Player Request Queue Manager Inside Cash In (deposit) & Cash Out (withdrawal) */}
        {(activeForm === "deposit" || activeForm === "withdrawal") && (
          <div className={`p-5 rounded-3xl border ${
            isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-4 border-b border-dashed border-slate-800 pb-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">
                  Player {activeForm === "deposit" ? "Cash In (Deposit)" : "Cash Out (Withdraw)"} Requests
                </h4>
                <p className="text-[10px] text-slate-500 font-sans">Verify, cancel, or approve players incoming request tickets</p>
              </div>

              {/* Simulation generator button */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                {onSimulatePlayerRequest && (
                  <button
                    id="trigger-simulate-player-req-btn"
                    onClick={() => onSimulatePlayerRequest(activeForm)}
                    type="button"
                    className="shrink-0 flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                  >
                    <Sparkles size={11} className="text-emerald-400" />
                    Simulate Player Request
                  </button>
                )}
                <span className="text-[9px] font-mono text-slate-500">
                  Global Pool: {activeForm === "deposit" ? `${globalPoolDeposits} Deposits (৳500)` : `${globalPoolWithdrawals} Withdraws (৳200)`} remaining
                </span>
              </div>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs mb-4">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-850">
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wide">Total Reg</p>
                <p className="text-sm font-black font-mono text-slate-300 mt-0.5">{txStats.total}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-850">
                <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-wide">Approved</p>
                <p className="text-sm font-black font-mono text-emerald-400 mt-0.5">{txStats.approved}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-850">
                <p className="text-[8px] font-bold text-rose-500 uppercase tracking-wide">Cancelled</p>
                <p className="text-sm font-black font-mono text-rose-400 mt-0.5">{txStats.cancelled}</p>
              </div>
              <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-900/60">
                <p className="text-[8px] font-bold text-neon-blue uppercase tracking-wide text-indigo-300">Pending</p>
                <p className="text-sm font-black font-mono text-indigo-400 mt-0.5 animate-pulse">{txStats.pending}</p>
              </div>
            </div>

            {/* List of custom pending requests with buttons */}
            <div className="space-y-2.5">
              {txStats.list.filter(t => t.status === "pending").map((tx) => (
                <div 
                  key={tx.id}
                  className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {tx.type === "deposit" ? "IN" : "OUT"}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-200">{tx.customerMobile}</span>
                        <span className="text-[8px] tracking-widest bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded font-mono uppercase">Pending Check</span>
                      </div>
                      <p className="text-[10px] text-zinc-450 mt-0.5">
                        Requested: <span className="font-bold text-slate-300">{tx.amount.toLocaleString()} BDT</span> • Commission BDT {tx.commissionEarned.toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      id={`approve-player-tx-${tx.id}`}
                      onClick={() => onApproveTransaction && onApproveTransaction(tx.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      id={`reject-player-tx-${tx.id}`}
                      onClick={() => onRejectTransaction && onRejectTransaction(tx.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}

              {txStats.list.filter(t => t.status === "pending").length === 0 && (
                <p className="text-xs text-center text-slate-500 italic py-2">No pending players pending request tickets.</p>
              )}
            </div>
          </div>
        )}

        {/* E-Wallet Agent Help Desk (আয় বৃদ্ধির উপায়) */}
        {activeForm === "help_desk" && (
          <div className="space-y-4 animate-fade-in">
            {/* Intro */}
            <div className={`p-5 rounded-3xl border text-center ${
              isDark ? "bg-gradient-to-br from-slate-950 to-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"
            }`}>
              <BookOpen className="mx-auto text-emerald-500 mb-2" size={32} />
              <h3 className="font-extrabold text-base tracking-tight">E-Wallet Agent Help Desk 💡</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                E-Wallet Agent প্রক্রিয়াটিতে কিভাবে আয় বাড়ানো যায় তা নিম্নে বিস্তারিত আলোচনা করা হলো।
              </p>
            </div>

            {/* Income Multipliers */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">How to Multiply Earnings</span>
              
              {/* Earning Tip 1 */}
              <div className={`p-4 rounded-3xl border flex gap-3 ${isDark ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
                <div className="w-8.5 h-8.5 shrink-0 rounded-full bg-emerald-500/10 text-emerald-550 flex items-center justify-center font-black">
                  1
                </div>
                <div>
                  <h5 className="font-black text-xs text-white">ডিপোজিটে উচ্চ ৫% ফ্ল্যাট কমিশন</h5>
                  <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
                    খেলোয়াড়দের Cash In (Deposit) করার অনুরোধগুলো দ্রুত এপ্রুভ করুন। প্রতি ১,০০০ টাকা ডিপোজিট রিকোয়েস্ট সম্পূর্ণ করলে আপনি পাবেন অত্যন্ত উচ্চ দরনের <span className="font-extrabold text-emerald-400">৫০ টাকা (৫% হারে)</span> কমিশন যা মুহূর্তেই আপনার Commission Balance-এ যোগ হবে।
                  </p>
                </div>
              </div>

              {/* Earning Tip 2 */}
              <div className={`p-4 rounded-3xl border flex gap-3 ${isDark ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
                <div className="w-8.5 h-8.5 shrink-0 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-black">
                  2
                </div>
                <div>
                  <h5 className="font-black text-xs text-white">উইথড্রতে ৩% কমিশন</h5>
                  <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
                    খেলোয়াড়দের Cash Out (Withdraw) অনুরোধগুলো সম্পূর্ণ করলেই প্রতি ১,০০০ টাকায় আপনি পাবেন <span className="font-extrabold text-blue-400">৩০ টাকা (৩% কমিশন)</span>। খেলোয়াড়দের যেকোনো সময় পেমেন্ট ক্লিয়ার করে আপনার উপার্জন ও সুনাম বৃদ্ধি করতে পারেন।
                  </p>
                </div>
              </div>

              {/* Earning Tip 3 */}
              <div className={`p-4 rounded-3xl border flex gap-3 ${isDark ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
                <div className="w-8.5 h-8.5 shrink-0 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                  3
                </div>
                <div>
                  <h5 className="font-black text-xs text-white">এজেন্ট রেফারেল নেটওয়ার্ক তৈরি করুন (৳৫০০ বোনাস)</h5>
                  <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
                    আপনার Invitation Link বা Referral Code ব্যবহার করে নতুন সাব-এজেন্টদের সিস্টেমে নিয়ে আসুন। রেফার করা নতুন ব্যবহারকারী সক্রিয় হলেই আপনি পাবেন <span className="font-extrabold text-amber-400">৳৫০০ ফ্ল্যাট রেফার বোনাস</span>।
                  </p>
                </div>
              </div>

              {/* Earning Tip 4 */}
              <div className={`p-4 rounded-3xl border flex gap-3 ${isDark ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
                <div className="w-8.5 h-8.5 shrink-0 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center font-black">
                  4
                </div>
                <div>
                  <h5 className="font-black text-xs text-white">ভলিউম বজায় রাখুন (Keep topped up)</h5>
                  <p className="text-[11px] leading-relaxed text-slate-400 mt-1">
                    আপনার Wallet Balance সব সময় পর্যাপ্ত রাখুন (কমপক্ষে ৫,০০০ থেকে ১০,০০০ টাকা)। ব্যালেন্স শূন্য থাকলে খেলোয়াড়দের ডিপোজিট এপ্রুভ করতে পারবেন না, এবং একটি ভালো কমিশন মিস করে ফেলবেন। ব্যালেন্স বাড়াতে Agent Cash অপশনটি ব্যবহার করুন।
                  </p>
                </div>
              </div>

            </div>

            {/* Quick stats box */}
            <div className="p-4 rounded-3xl bg-emerald-950/20 border border-emerald-900/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] block text-slate-400 uppercase tracking-widest font-bold">Estimated Monthly Yield</span>
                <span className="text-xl font-black text-white font-mono">BDT 15,000 - 45,000+</span>
              </div>
              <Trophy className="text-amber-500 animate-pulse" size={28} />
            </div>
          </div>
        )}

        {/* History of Agent Cash Requests (Load capital requests) displayed inside Agent Cash */}
        {activeForm === "agent_cash" && (
          <div className={`p-5 rounded-3xl border ${isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"}`}>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">Balance Load Requests Registry</span>
            
            <div className="space-y-2">
              {agentCashRequests.map((req) => (
                <div 
                  key={req.id} 
                  className="p-3 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">৳{req.amount} BDT Loaded (${req.usdAmount} USD)</p>
                    <p className="text-[10px] text-slate-500 font-mono">Method: {req.method} • TxnID: {req.transactionId}</p>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    req.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                    req.status === "rejected" ? "bg-rose-500/10 text-rose-450" : "bg-amber-500/10 text-amber-500 animate-pulse"
                  }`}>
                    {req.status === "approved" ? "Success" : req.status === "rejected" ? "Rejected" : "Pending Check"}
                  </span>
                </div>
              ))}

              {agentCashRequests.length === 0 && (
                <p className="text-xs text-center text-slate-500 py-2">No balance requests recorded yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Transactin Ledger History Section */}
        {activeForm !== "agent_cash" && activeForm !== "help_desk" && (
          <div className={`p-5 rounded-3xl border transition-all ${
            isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">{t.recentTx}</h4>
                <p className="text-[10px] text-slate-500">{lang === "English" ? "Yield and commission ledger history logs" : "আয় এবং কমিশন লেনদেনের বিবরণ"}</p>
              </div>

              {/* Filtering Controls */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div className="relative flex-1 sm:max-w-44">
                  <Search size={11} className="absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search ledger..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full p-2 pl-8.5 rounded-2xl text-[10px] focus:outline-emerald-500 border ${
                      isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-800"
                    }`}
                  />
                </div>

                <select
                  id="ledger-type-filter"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className={`p-1.5 rounded-xl border text-[10px] focus:outline-emerald-500 max-w-24 font-bold cursor-pointer ${
                    isDark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-650"
                  }`}
                >
                  <option value="all">All Logs</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdraws</option>
                  <option value="recharge">Recharges</option>
                  <option value="bill_pay">Bills</option>
                  <option value="agent_withdraw">Outs</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  id={`ledger-txn-item-${tx.id}`}
                  onClick={() => setReceipt(tx)}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    isDark ? "bg-slate-900/40 border-slate-850 hover:bg-slate-900" : "bg-white border-slate-100 hover:bg-slate-50 shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold leading-none shrink-0 ${
                      tx.type === "deposit" ? "bg-emerald-500/10 text-emerald-500" : 
                      tx.type === "withdrawal" ? "bg-blue-500/10 text-blue-550" :
                      tx.type === "recharge" ? "bg-sky-500/10 text-sky-500" :
                      tx.type === "agent_withdraw" ? "bg-rose-500/15 text-rose-400" :
                      "bg-amber-500/10 text-amber-500"
                    }`}>
                      {tx.type === "deposit" ? "IN" : 
                       tx.type === "withdrawal" ? "OUT" : 
                       tx.type === "recharge" ? "RC" : 
                       tx.type === "agent_withdraw" ? "WD" : "BL"}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-extrabold capitalize">
                          {tx.type === "deposit" ? t.cashIn : 
                           tx.type === "withdrawal" ? t.cashOut : 
                           tx.type === "recharge" ? t.recharge : 
                           tx.type === "agent_withdraw" ? "Comm Withdraw" : t.billPay}
                        </p>
                        <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full capitalize ${
                          tx.status === "success" ? "bg-emerald-500/10 text-emerald-400" : 
                          tx.status === "failed" ? "bg-rose-500/10 text-rose-550" : "bg-amber-500/10 text-amber-500 animate-pulse"
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {tx.customerMobile} • {new Date(tx.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-bold font-mono">
                      {(tx.type === "withdrawal" || tx.type === "agent_withdraw") ? "-" : "-"}{tx.amount} BDT
                    </p>
                    {tx.commissionEarned > 0 ? (
                      <p className="text-[9px] font-bold text-emerald-500">
                        +{tx.commissionEarned} BDT Comm.
                      </p>
                    ) : (
                      <p className="text-[9px] text-slate-500 font-mono">No Commission</p>
                    )}
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <p className="text-xs text-center text-slate-500 py-6">No transactions match your filter query.</p>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Dynamic Digital Receipt Popup Dialog */}
      {receipt && (
        <div className="absolute inset-x-0 bottom-0 top-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-[32px] p-6 border shadow-2xl relative animate-fade-in ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <button
              id="close-receipt-btn"
              onClick={() => setReceipt(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800/10 text-slate-450 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <span className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 animate-bounce ${
                receipt.status === "success" ? "bg-emerald-500/10 text-emerald-500" :
                receipt.status === "failed" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500"
              }`}>
                <CheckCircle2 size={26} />
              </span>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-emerald-500">Transaction Details</h3>
              <p className="text-[9px] text-slate-400 font-mono mt-0.5">ESTABLISHED PREVIEW TRANSACTION</p>
            </div>

            <div className="my-4 border-t border-b border-dashed border-slate-700 py-3.5 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-450">ID REFERENCE:</span>
                <span className="font-extrabold text-right">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">OPERATOR:</span>
                <span className="font-bold text-slate-300 capitalize">{receipt.agentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">STATUS:</span>
                <span className={`font-extrabold capitalize ${
                  receipt.status === "success" ? "text-emerald-400" : receipt.status === "failed" ? "text-rose-500" : "text-amber-500"
                }`}>{receipt.status.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">OPERATION:</span>
                <span className="font-extrabold capitalize text-teal-400">{receipt.type.toUpperCase().replace("_", " ")}</span>
              </div>
              {receipt.operator && (
                <div className="flex justify-between">
                  <span className="text-slate-450">MOBILE BRAND:</span>
                  <span className="font-bold">{receipt.operator}</span>
                </div>
              )}
              {receipt.billType && (
                <div className="flex justify-between">
                  <span className="text-slate-450">BILL TYPE:</span>
                  <span className="font-bold">{receipt.billType}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-450">CLIENT:</span>
                <span className="font-bold">{receipt.customerMobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-450">TIMESTAMP:</span>
                <span>{new Date(receipt.timestamp).toLocaleString()}</span>
              </div>
              
              <div className="border-t border-dashed border-slate-700 pt-2.5 mt-2 flex justify-between font-sans">
                <span className="font-bold text-slate-400 text-[10px] uppercase">Transaction Amount:</span>
                <span className="font-black text-sm text-sky-400 font-mono">{receipt.amount.toLocaleString()} BDT</span>
              </div>
              
              {receipt.commissionEarned > 0 && (
                <div className="flex justify-between font-sans">
                  <span className="font-bold text-slate-400 text-[10px] uppercase">My Yield Earnings:</span>
                  <span className="font-extrabold text-xs text-emerald-500 font-mono">+{receipt.commissionEarned} BDT</span>
                </div>
              )}
            </div>

            <button
              id="confirm-close-receipt-btn"
              onClick={() => setReceipt(null)}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/10 cursor-pointer transition-all text-center"
            >
              Done & Save
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
