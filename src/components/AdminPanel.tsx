import React, { useState, useMemo } from "react";
import { 
  Users, 
  CheckCircle2, 
  AlertOctagon, 
  Trash2, 
  Percent, 
  Megaphone, 
  Eye, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Database,
  Search,
  Sliders,
  DollarSign,
  Plus,
  LogOut,
  Bell
} from "lucide-react";
import { Agent, Customer, Transaction, Notification, AgentStatus, AgentCashRequest } from "../types";

interface AdminPanelProps {
  agents: Agent[];
  customers: Customer[];
  transactions: Transaction[];
  notifications: Notification[];
  agentCashRequests?: AgentCashRequest[];
  onProcessAgentCashRequest?: (requestId: string, status: "approved" | "rejected") => void;
  globalPoolDeposits?: number;
  globalPoolWithdrawals?: number;
  onRefillGlobalPool?: () => void;
  onUpdateAgentStatus: (agentId: string, status: AgentStatus) => void;
  onDeleteAgent: (agentId: string) => void;
  onAddNotification: (not: Omit<Notification, "id" | "timestamp" | "read">) => void;
  onAdminLogout: () => void;
  isDark: boolean;
  onOpenNotifications: () => void;
  unreadNotificationCount: number;
}

export default function AdminPanel({
  agents,
  customers,
  transactions,
  notifications,
  agentCashRequests = [],
  onProcessAgentCashRequest,
  globalPoolDeposits = 200,
  globalPoolWithdrawals = 200,
  onRefillGlobalPool,
  onUpdateAgentStatus,
  onDeleteAgent,
  onAddNotification,
  onAdminLogout,
  isDark,
  onOpenNotifications,
  unreadNotificationCount
}: AdminPanelProps) {
  // Tabs within Admin panel: "dashboard", "agents", "ledgers", "rates", "alerts"
  const [adminTab, setAdminTab] = useState<"dashboard" | "agents" | "ledgers" | "rates" | "alerts">("dashboard");

  // Dynamic system overview stats
  const stats = useMemo(() => {
    const totalTxVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalAgentCommissions = transactions.reduce((sum, tx) => sum + tx.commissionEarned, 0);
    const systemRevenueCut = totalTxVolume * 0.005; // System takes 0.5% flat platform processing profit

    return {
      totalVolume: totalTxVolume,
      agentEarned: totalAgentCommissions,
      revenueCut: systemRevenueCut,
      approvedCount: agents.filter(a => a.status === "approved").length,
      pendingCount: agents.filter(a => a.status === "pending").length,
      suspendedCount: agents.filter(a => a.status === "suspended").length,
    };
  }, [agents, transactions]);

  // Alert builder inputs
  const [alertTitle, setAlertTitle] = useState("");
  const [alertBody, setAlertBody] = useState("");
  const [alertType, setAlertType] = useState<"broadcast" | "individual">("broadcast");
  const [targetAgent, setTargetAgent] = useState("");
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  // Commission Rates simulator settings
  const [depRate, setDepRate] = useState(5.0);
  const [withRate, setWithRate] = useState(3.0);
  const [refRate, setRefRate] = useState(500);
  const [ratesSuccess, setRatesSuccess] = useState(false);

  // Agents Filter Search
  const [agentQuery, setAgentQuery] = useState("");
  const searchedAgents = useMemo(() => {
    return agents.filter(a => 
      a.name.toLowerCase().includes(agentQuery.toLowerCase()) || 
      a.mobile.includes(agentQuery)
    );
  }, [agents, agentQuery]);

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitle || !alertBody) {
      alert("Please fill in notification context");
      return;
    }

    onAddNotification({
      type: alertType,
      recipientAgentId: alertType === "individual" ? targetAgent : null,
      title: alertTitle,
      body: alertBody
    });

    setAlertSuccess(`Broadcast alert '${alertTitle}' published into notification feed!`);
    setAlertTitle("");
    setAlertBody("");
    setTimeout(() => setAlertSuccess(null), 3000);
  };

  const handleUpdateRates = (e: React.FormEvent) => {
    e.preventDefault();
    setRatesSuccess(true);
    setTimeout(() => setRatesSuccess(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden select-none">
      
      {/* Title */}
      <div className={`p-4 border-b shrink-0 flex items-center justify-between ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-50"}`}>
        <div>
          <h3 className="font-extrabold text-base tracking-tight text-blue-500">Super Admin Control Core</h3>
          <p className="text-[10px] text-slate-400">Manage wallets, users, systems, and metrics</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notifications Icon Tray alert toggle */}
          <button
            id="admin-notification-bell-btn"
            onClick={onOpenNotifications}
            title="View Notifications"
            className={`p-1.5 rounded-xl border relative transition-all cursor-pointer shadow-sm ${
              isDark 
                ? "bg-slate-950 border-slate-805 text-slate-300 hover:bg-slate-900" 
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Bell size={12} />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          <span className="p-1 px-2.5 rounded-full bg-blue-500/10 text-blue-500 font-mono text-[9px] font-bold">
            SUPER ADMIN ACTIVE
          </span>
          <button
            id="admin-logout-trigger-btn"
            onClick={onAdminLogout}
            title="Secure Exit Console"
            className="p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500 text-rose-500 hover:text-white font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>

      {/* Selector Subtabs */}
      <div className={`flex scrollbar-none overflow-x-auto gap-0.5 px-3 py-2 shrink-0 border-b ${isDark ? "bg-slate-950 border-slate-905" : "bg-slate-50 border-slate-100"}`}>
        {(["dashboard", "agents", "ledgers", "rates", "alerts"] as const).map((tab) => (
          <button
            key={tab}
            id={`admin-subtab-btn-${tab}`}
            onClick={() => setAdminTab(tab)}
            className={`py-1.5 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
              adminTab === tab
                ? "bg-blue-600 text-white"
                : isDark ? "text-slate-400 hover:bg-slate-900" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 scrollbar-none pt-4 space-y-4">
        
        {/* SUBTAB 1: SYSTEM MONITORING DASHBOARD */}
        {adminTab === "dashboard" && (
          <div className="space-y-4 animate-fade-in">
            
            {/* KPI grid row */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className={`p-3.5 rounded-2xl border text-center ${isDark ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
                <span className="text-[8px] uppercase font-bold tracking-wider text-slate-500">Total Registered Agents</span>
                <p className="text-xl font-black font-mono mt-1 text-slate-100">{agents.length}</p>
                <p className="text-[8px] text-emerald-500 mt-1">● {stats.approvedCount} Active approved</p>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${isDark ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
                <span className="text-[8px] uppercase font-bold tracking-wider text-slate-500">Total Client Customers</span>
                <p className="text-xl font-black font-mono mt-1 text-slate-100">{customers.length}</p>
                <p className="text-[8px] text-slate-500 mt-1">Through agent sign-ups</p>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${isDark ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
                <span className="text-[8px] uppercase font-bold tracking-wider text-slate-500">System Capital Fluidity</span>
                <p className="text-sm font-black font-mono mt-1 text-sky-400">৳{stats.totalVolume.toLocaleString()}</p>
                <p className="text-[8px] text-slate-500 mt-1">{transactions.length} total digital tx</p>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center ${isDark ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-100 shadow-sm"}`}>
                <span className="text-[8px] uppercase font-bold tracking-wider text-slate-500">Admin Cut Processing Fee</span>
                <p className="text-sm font-black font-mono mt-1 text-emerald-500">৳{stats.revenueCut.toLocaleString()}</p>
                <p className="text-[8px] text-slate-500 mt-1">Platform 0.5% system profit</p>
              </div>
            </div>

            {/* Quick overview statuses bar */}
            <div className={`p-4 rounded-3xl border space-y-3 ${isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"}`}>
              <div className="flex items-center gap-2">
                <Database size={13} className="text-blue-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Compliance Audit Queue</span>
              </div>

              {agents.filter(a => a.status === "pending").map((a) => (
                <div key={a.agentId} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold">{a.name}</h5>
                    <p className="text-[9px] font-mono text-slate-500">{a.mobile}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      id={`approve-pending-${a.agentId}`}
                      onClick={() => onUpdateAgentStatus(a.agentId, "approved")}
                      className="py-1 px-2.5 rounded-lg bg-emerald-600 text-white font-extrabold text-[9px] uppercase cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      id={`suspend-pending-${a.agentId}`}
                      onClick={() => onUpdateAgentStatus(a.agentId, "suspended")}
                      className="py-1 px-2.5 rounded-lg bg-rose-600/10 text-rose-500 font-extrabold text-[9px] uppercase cursor-pointer"
                    >
                      Refuse
                    </button>
                  </div>
                </div>
              ))}

              {agents.filter(a => a.status === "pending").length === 0 && (
                <p className="text-[10px] text-center text-slate-500">No agents awaiting system approval metrics.</p>
              )}
            </div>

            {/* System Player Request Pool status / refiller */}
            <div className={`p-4.5 rounded-3xl border space-y-4 ${isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database size={13} className="text-emerald-500" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450">System Player Request Pool (200 + 200 Limit)</span>
                </div>
                {onRefillGlobalPool && (
                  <button
                    id="admin-refill-pool-btn"
                    type="button"
                    onClick={onRefillGlobalPool}
                    className="py-1 px-2.5 rounded-lg bg-emerald-650 text-white font-extrabold text-[9px] uppercase cursor-pointer transition-all hover:bg-emerald-650/80"
                  >
                    Reset & Refill Pool (200 each)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-center text-xs">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850">
                  <p className="text-[9px] font-bold text-emerald-400 uppercase">Deposit Requests (500 BDT)</p>
                  <p className="text-lg font-black font-mono mt-0.5">{globalPoolDeposits} <span className="text-slate-500 text-xs">/ 200</span></p>
                  <p className="text-[8px] text-slate-450 mt-1">Earns: 25 BDT commission each</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-850">
                  <p className="text-[9px] font-bold text-blue-400 uppercase">Withdraw Requests (200 BDT)</p>
                  <p className="text-lg font-black font-mono mt-0.5">{globalPoolWithdrawals} <span className="text-slate-500 text-xs">/ 200</span></p>
                  <p className="text-[8px] text-slate-450 mt-1">Earns: 6 BDT commission each</p>
                </div>
              </div>
            </div>

            {/* Agent Cash Load Requests Authorization Panel */}
            <div className={`p-4.5 rounded-3xl border space-y-3.5 ${isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"}`}>
              <div className="flex items-center gap-2">
                <Sliders size={13} className="text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-350">Agent Cash Load Requests ({agentCashRequests.filter(r => r.status === "pending").length} Pending)</span>
              </div>

              <div className="space-y-2.5">
                {agentCashRequests.map((req) => (
                  <div key={req.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-850 flex flex-col gap-2.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-200">{req.agentName} <span className="text-[10px] font-normal font-sans text-slate-550Format">• {req.senderNumber}</span></h5>
                        <p className="text-[11px] font-mono text-emerald-400 font-bold mt-0.5">৳{req.amount} BDT (${req.usdAmount} USD) via {req.method}</p>
                        <p className="text-[9px] text-slate-500 font-mono">Date: {new Date(req.timestamp).toLocaleDateString()} • TxnID: {req.transactionId}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                        req.status === "rejected" ? "bg-rose-500/10 text-rose-500" : "bg-amber-500/10 text-amber-500 animate-pulse"
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    {req.status === "pending" && onProcessAgentCashRequest && (
                      <div className="flex gap-2 justify-end border-t border-slate-800/40 pt-2.5">
                        <button
                          id={`admin-approve-cash-${req.id}`}
                          type="button"
                          onClick={() => onProcessAgentCashRequest(req.id, "approved")}
                          className="py-1 px-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[9px] uppercase cursor-pointer"
                        >
                          Approve Load
                        </button>
                        <button
                          id={`admin-reject-cash-${req.id}`}
                          type="button"
                          onClick={() => onProcessAgentCashRequest(req.id, "rejected")}
                          className="py-1 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[9px] uppercase cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {(!agentCashRequests || agentCashRequests.length === 0) && (
                  <p className="text-[10px] text-center text-slate-500 italic py-1">No balance requests filed by agents yet.</p>
                )}
              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 2: AGENT DIRECTORY & COMPLIANCE MODIFIERS */}
        {adminTab === "agents" && (
          <div className="space-y-4 animate-fade-in">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search registered agents directory..."
                value={agentQuery}
                onChange={(e) => setAgentQuery(e.target.value)}
                className={`w-full p-2 pl-8.5 rounded-xl text-xs focus:outline-blue-500 border ${
                  isDark ? "bg-slate-950 border-slate-800 text-slate-350" : "bg-white border-slate-200"
                }`}
              />
            </div>

            <div className="space-y-2">
              {searchedAgents.map((a) => (
                <div
                  key={a.agentId}
                  className={`p-3.5 rounded-2xl border space-y-3 ${
                    isDark ? "bg-slate-900/40 border-slate-850" : "bg-white border-slate-50 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold">{a.name}</h4>
                      <p className="text-[9px] font-mono text-slate-400 mt-0.5">{a.mobile} • Balance: {a.walletBalance.toLocaleString()} BDT</p>
                    </div>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      a.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                      a.status === "suspended" ? "bg-rose-500/10 text-rose-550Format" : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {a.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/40 flex justify-between gap-1.5">
                    <div className="flex gap-1">
                      {a.status !== "approved" && (
                        <button
                          id={`agent-approve-btn-${a.agentId}`}
                          onClick={() => onUpdateAgentStatus(a.agentId, "approved")}
                          className="py-1 px-2 text-[9px] font-bold bg-emerald-600 rounded text-white cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      {a.status !== "suspended" && (
                        <button
                          id={`agent-suspend-btn-${a.agentId}`}
                          onClick={() => onUpdateAgentStatus(a.agentId, "suspended")}
                          className="py-1 px-2 text-[9px] font-bold bg-rose-600/10 text-rose-500 rounded cursor-pointer"
                        >
                          Suspend
                        </button>
                      )}
                    </div>

                    {/* Disable deleting self to prevent sandbox crash */}
                    <button
                      id={`agent-delete-btn-${a.agentId}`}
                      onClick={() => {
                        if (a.agentId === "agent_1") {
                          alert("System Security Denied: Cannot delete primary demo agent accounts.");
                          return;
                        }
                        if (confirm(`Delete agent ${a.name} permanently?`)) {
                          onDeleteAgent(a.agentId);
                        }
                      }}
                      className="p-1 text-slate-500 hover:text-rose-500 rounded cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 3: COMPOSITE CASH LEDGERS */}
        {adminTab === "ledgers" && (
          <div className="space-y-3 animate-fade-in">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Cross-Agent Audits</span>
            
            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                  isDark ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-100 shadow-sm"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      tx.type === "deposit" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-500"
                    }`}>
                      {tx.type[0].toUpperCase()}
                    </span>
                    <div>
                      <p className="font-extrabold capitalize text-slate-205">{tx.type} by {tx.agentName}</p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5">{tx.customerMobile} • {tx.receiptNumber}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-slate-100 shrink-0">
                    ৳{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBTAB 4: TRANSACTION COMMISSION RATE ADJUSTERS */}
        {adminTab === "rates" && (
          <form onSubmit={handleUpdateRates} className={`p-5 rounded-3xl border space-y-4 animate-fade-in ${
            isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150 shadow-sm"
          }`}>
            <div className="flex items-center gap-2">
              <Sliders size={13} className="text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-350 block">Adjust Commission Ratios</span>
            </div>

            {ratesSuccess && (
              <p className="text-[10px] text-center font-bold text-emerald-500">Commission rules updated synchronously into Firestore!</p>
            )}

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold">Flat Cash-In Commission</span>
                <span className="font-mono text-emerald-400">{depRate}%</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="10.0"
                step="0.5"
                value={depRate}
                onChange={(e) => setDepRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold">Flat Cash-Out Commission</span>
                <span className="font-mono text-blue-400">{withRate}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="8.0"
                step="0.1"
                value={withRate}
                onChange={(e) => setWithRate(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="font-bold">Referral Sign-Up Payout Reward</span>
                <span className="font-mono text-yellow-500">{refRate} BDT</span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={refRate}
                onChange={(e) => setRefRate(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <button
              id="admin-rates-update-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-all text-center"
            >
              Push Rates Update
            </button>
          </form>
        )}

        {/* SUBTAB 5: SYSTEM BROADCAST TRANSMITTER */}
        {adminTab === "alerts" && (
          <form onSubmit={handleSendNotification} className={`p-5 rounded-3xl border space-y-4 animate-fade-in ${
            isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150 shadow-sm"
          }`}>
            <div className="flex items-center gap-2">
              <Megaphone size={14} className="text-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-350 block">Transmit App Notification Alerts</span>
            </div>

            {alertSuccess && (
              <p className="text-[10px] bg-emerald-500/10 p-2 border border-emerald-500/20 text-emerald-400 rounded-xl">{alertSuccess}</p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                id="alert-type-broadcast"
                onClick={() => setAlertType("broadcast")}
                className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  alertType === "broadcast" ? "bg-blue-600 text-white" : isDark ? "bg-slate-900 text-slate-400" : "bg-slate-100 text-slate-500"
                }`}
              >
                Broadcast
              </button>
              <button
                type="button"
                id="alert-type-individual"
                onClick={() => setAlertType("individual")}
                className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  alertType === "individual" ? "bg-blue-600 text-white" : isDark ? "bg-slate-900 text-slate-400" : "bg-slate-100 text-slate-500"
                }`}
              >
                Direct Agent
              </button>
            </div>

            {alertType === "individual" && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Target Agent</span>
                <select
                  id="target-agent-select"
                  value={targetAgent}
                  onChange={(e) => setTargetAgent(e.target.value)}
                  className={`w-full p-2 border rounded-xl text-xs focus:outline-blue-500 ${
                    isDark ? "bg-slate-900 border-slate-805 text-slate-300" : "bg-white border-slate-200"
                  }`}
                >
                  <option value="">Select Agent ID...</option>
                  {agents.map(a => (
                    <option key={a.agentId} value={a.agentId}>{a.name} ({a.mobile})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Alert Topic Title</span>
              <input
                type="text"
                value={alertTitle}
                onChange={(e) => setAlertTitle(e.target.value)}
                placeholder="e.g. Server under maintenance tonight"
                className={`w-full p-2 border rounded-xl text-xs focus:outline-blue-500 ${
                  isDark ? "bg-slate-900 border-slate-805 text-slate-300" : "bg-white border-slate-200"
                }`}
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">Alert Message Content</span>
              <textarea
                value={alertBody}
                onChange={(e) => setAlertBody(e.target.value)}
                placeholder="e.g. Core systems undergo secure databases backup between 2:00 AM to 4:00 AM."
                rows={3}
                className={`w-full p-2 border rounded-xl text-xs focus:outline-blue-500 ${
                  isDark ? "bg-slate-900 border-slate-805 text-slate-300" : "bg-white border-slate-200"
                }`}
              />
            </div>

            <button
              id="send-admin-notification-btn"
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-all text-center"
            >
              Broadcast Alert
            </button>
          </form>
        )}

      </div>

    </div>
  );
}
