import React, { useState } from "react";
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  PhoneCall, 
  FileText, 
  Users, 
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  UserPlus,
  Bell,
  CreditCard,
  Landmark,
  BookOpen,
  Send
} from "lucide-react";
import { Transaction, Agent, Language, TransactionType } from "../types";
import { TRANSLATIONS } from "../data";

interface DashboardTabProps {
  agent: Agent;
  transactions: Transaction[];
  lang: Language;
  onLaunchOperation: (type: TransactionType) => void;
  onNavigateToTab: (tab: any) => void;
  isDark: boolean;
  onOpenNotifications: () => void;
  unreadNotificationCount: number;
}

export default function DashboardTab({
  agent,
  transactions,
  lang,
  onLaunchOperation,
  onNavigateToTab,
  isDark,
  onOpenNotifications,
  unreadNotificationCount
}: DashboardTabProps) {
  const [showBalance, setShowBalance] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const t = TRANSLATIONS[lang];

  // Pull to refresh simulation
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Extract stats for today (mock calculations using 2026-06-09 system date)
  const todayDateStr = "2026-06-09";
  const todayTx = transactions.filter(tx => tx.timestamp.startsWith(todayDateStr));
  const todayTxAmount = todayTx.reduce((sum, tx) => sum + tx.amount, 0);
  const todayEarnings = todayTx.reduce((sum, tx) => sum + tx.commissionEarned, 0);

  // Recent transactions (last 3 items)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 3);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pb-20 scrollbar-none px-4">
      
      {/* Header Profile Summary */}
      <div className="flex items-center justify-between py-4">
        <div>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.agentName}</p>
          <h3 className="font-bold text-lg tracking-tight">{agent.name}</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Notifications Icon Tray alert toggle */}
          <button
            id="dashboard-notification-bell-btn"
            onClick={onOpenNotifications}
            className={`p-2 rounded-full border transition-all cursor-pointer relative ${
              isDark 
                ? "border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700" 
                : "border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-350"
            }`}
          >
            <Bell size={16} />
            {unreadNotificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[8px] font-black font-sans text-white rounded-full flex items-center justify-center animate-bounce">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          <button 
            id="refresh-dashboard-btn"
            onClick={handleRefresh}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              refreshing ? "animate-spin border-emerald-500 text-emerald-500" : isDark ? "border-slate-800 text-slate-300 hover:bg-slate-900" : "border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="Pull to Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Account Status Flags (Pending / Suspended Alert boxes) */}
      {agent.status === "suspended" && (
        <div className="mb-4 p-4.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
          <AlertOctagon size={20} className="text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider">{t.suspended}</h4>
            <p className="text-[11px] leading-relaxed mt-0.5 text-rose-300">
              Your digital wallet is suspended by the admin. Cash-in, bills, and mobile payouts are offline. Please contact helpline.
            </p>
          </div>
        </div>
      )}

      {agent.status === "pending" && (
        <div className="mb-4 p-4.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 animate-pulse">
          <AlertOctagon size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">{t.pendingApproval}</h4>
            <p className="text-[11px] leading-relaxed mt-0.5 text-amber-300">
              Your agent profile is undergoing system compliance evaluation. You are in read-only sandbox mode.
            </p>
          </div>
        </div>
      )}

      {/* Immersive Dual-Balance Tap-to-Reveal Card */}
      <div className="relative mb-5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-3xl p-5 text-white shadow-xl shadow-emerald-950/10 overflow-hidden select-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-teal-500/15 rounded-full blur-xl" />

        <div className="flex justify-between items-center z-10 relative mb-3.5">
          <span className="text-[9px] font-mono tracking-wider bg-emerald-500/40 text-emerald-50 px-2 py-0.5 rounded-full font-bold">
            AGENT PORTAL DUAL ENGINE
          </span>
          <span className="text-[10px] text-emerald-200/90 font-mono">Code: {agent.referralCode}</span>
        </div>

        {/* Both balance categories side by side */}
        <div className="grid grid-cols-2 gap-4 pb-3.5 border-b border-white/10 z-10 relative">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-100/80">Wallet Balance</span>
            <div className="mt-1 flex items-baseline h-8">
              <span className="text-[10px] mr-1 font-semibold text-emerald-200">BDT</span>
              {showBalance ? (
                <span className="text-xl font-black tracking-tight font-mono animate-fade-in truncate">
                  {(agent.walletBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-200/65 leading-none">••••••••</span>
              )}
            </div>
          </div>

          <div className="border-l border-white/10 pl-4">
            <span className="text-[10px] uppercase tracking-wider font-bold text-teal-100/80">Commission Balance</span>
            <div className="mt-1 flex items-baseline h-8">
              <span className="text-[10px] mr-1 font-semibold text-teal-200 font-mono">BDT</span>
              {showBalance ? (
                <span className="text-xl font-black tracking-tight font-mono animate-fade-in text-teal-300 truncate">
                  {(agent.commissionBalance || 0).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </span>
              ) : (
                <span className="text-xs font-semibold text-teal-200/65 leading-none">••••••••</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 z-10 relative">
          <button
            id="toggle-balance-view-btn"
            onClick={() => setShowBalance(!showBalance)}
            className="flex items-center gap-1.5 py-1 px-3.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer"
          >
            {showBalance ? (
              <>
                <EyeOff size={11} /> Hide Balance
              </>
            ) : (
              <>
                <Eye size={11} /> Tap for Balance
              </>
            )}
          </button>
          
          <span className="text-[9px] text-emerald-200/95 font-sans italic">Rates: Deposit 5% • Withdraw 3%</span>
        </div>
      </div>

      {/* Grid Stats Counters (Today's highlights) */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className={`p-4 rounded-2xl border transition-all ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-550"}`}>{t.todayTxCount}</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-xl font-extrabold tracking-tight font-mono">{todayTx.length}</span>
            <span className="text-[10px] text-slate-500 font-sans">bills / tx</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 font-sans">
            <TrendingUp size={10} className="text-emerald-500" />
            <span>Vol: {todayTxAmount} BDT</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100 shadow-sm"}`}>
          <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>{t.todayEarnings}</p>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-xl font-extrabold tracking-tight font-mono text-emerald-500">+{todayEarnings}</span>
            <span className="text-[10px] text-emerald-505 font-bold">BDT</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 font-sans">
            <Sparkles size={10} className="text-yellow-500" />
            <span>Earn: 5% & 3% Flat</span>
          </div>
        </div>
      </div>

      {/* Quick Ops Launcher (Material Design Grid Icons) */}
      <div className="mb-6">
        <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-slate-400" : "text-slate-555"}`}>
          Wallet Solutions
        </h4>
        <div className="grid grid-cols-4 gap-2">
          
          <button
            id="dash-op-cashin-btn"
            onClick={() => onLaunchOperation("deposit")}
            className="flex flex-col items-center p-2 rounded-2xl transition-all hover:bg-emerald-500/10 outline-none select-none text-center cursor-pointer"
          >
            <span className="w-11 h-11 mb-1.5 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-sm">
              <ArrowUpRight size={20} />
            </span>
            <span className="text-[9px] font-extrabold leading-tight break-words">{t.cashIn}</span>
          </button>

          <button
            id="dash-op-cashout-btn"
            onClick={() => onLaunchOperation("withdrawal")}
            className="flex flex-col items-center p-2 rounded-2xl transition-all hover:bg-blue-500/10 outline-none select-none text-center cursor-pointer"
          >
            <span className="w-11 h-11 mb-1.5 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-sm">
              <ArrowDownLeft size={20} />
            </span>
            <span className="text-[9px] font-extrabold leading-tight break-words">{t.cashOut}</span>
          </button>

          <button
            id="dash-op-recharge-btn"
            onClick={() => onLaunchOperation("recharge")}
            className="flex flex-col items-center p-2 rounded-2xl transition-all hover:bg-sky-500/10 outline-none select-none text-center cursor-pointer"
          >
            <span className="w-11 h-11 mb-1.5 rounded-2xl bg-sky-500/10 text-sky-555 flex items-center justify-center shadow-sm">
              <PhoneCall size={18} />
            </span>
            <span className="text-[9px] font-extrabold leading-tight break-words">{t.recharge}</span>
          </button>

          <button
            id="dash-op-billpay-btn"
            onClick={() => onLaunchOperation("bill_pay")}
            className="flex flex-col items-center p-2 rounded-2xl transition-all hover:bg-amber-500/10 outline-none select-none text-center cursor-pointer"
          >
            <span className="w-11 h-11 mb-1.5 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-sm">
              <FileText size={18} />
            </span>
            <span className="text-[9px] font-extrabold leading-tight break-words">{t.billPay}</span>
          </button>

          <button
            id="dash-op-agentcash-btn"
            onClick={() => onLaunchOperation("agent_cash")}
            className="flex flex-col items-center p-2 rounded-2xl transition-all hover:bg-emerald-500/10 outline-none select-none text-center cursor-pointer font-bold"
          >
            <span className="w-11 h-11 mb-1.5 rounded-2xl bg-emerald-500/10 text-emerald-505 flex items-center justify-center shadow-sm">
              <CreditCard size={18} />
            </span>
            <span className="text-[9px] font-extrabold leading-tight break-words">Agent Cash</span>
          </button>

          <button
            id="dash-op-agentwithdraw-btn"
            onClick={() => onLaunchOperation("agent_withdraw")}
            className="flex flex-col items-center p-2 rounded-2xl transition-all hover:bg-rose-500/10 outline-none select-none text-center cursor-pointer font-bold"
          >
            <span className="w-11 h-11 mb-1.5 rounded-2xl bg-rose-500/15 text-rose-455 flex items-center justify-center shadow-sm">
              <Landmark size={18} />
            </span>
            <span className="text-[9px] font-extrabold leading-tight break-words">Agent Out</span>
          </button>

          <button
            id="dash-op-helpdesk-btn"
            onClick={() => onLaunchOperation("help_desk")}
            className="flex flex-col items-center p-2 rounded-2xl transition-all hover:bg-purple-500/10 outline-none select-none text-center cursor-pointer"
          >
            <span className="w-11 h-11 mb-1.5 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center shadow-sm">
              <BookOpen size={18} />
            </span>
            <span className="text-[9px] font-extrabold leading-tight break-words">Help Desk</span>
          </button>

          <a
            id="dash-op-telegram-btn"
            href="https://t.me/bdwalletagent"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center p-2 rounded-2xl transition-all hover:bg-sky-500/10 outline-none select-none text-center cursor-pointer text-inherit no-underline"
          >
            <span className="w-11 h-11 mb-1.5 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center shadow-md hover:scale-105 transition-transform border border-sky-400/20">
              <Send size={18} className="translate-x-[-1px] rotate-[-20deg]" />
            </span>
            <span className="text-[9px] font-extrabold leading-tight break-words">{t.telegramSupport}</span>
          </a>

        </div>
      </div>

      {/* Refer & Earn Banner */}
      <div className={`p-4.5 mb-6 rounded-3xl border flex items-center justify-between transition-all ${
        isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-100 shadow-sm"
      }`}>
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <UserPlus size={18} />
          </span>
          <div>
            <h5 className="font-bold text-xs text-amber-500 uppercase tracking-wider">{t.referAndEarn}</h5>
            <p className={`text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Invite new agents & receive 500 BDT or 10% commission share!
            </p>
          </div>
        </div>
        <button 
          id="dash-nav-referrals-btn"
          onClick={() => onNavigateToTab("earnings")} 
          className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-emerald-500 transition-all cursor-pointer"
        >
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Recent Transactions menu */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-550"}`}>
            {t.recentTx}
          </h4>
          <button 
            id="dash-nav-transactions-btn"
            onClick={() => onNavigateToTab("transactions")} 
            className="text-[10px] font-semibold text-emerald-500 flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            See All <ArrowRight size={10} />
          </button>
        </div>

        <div className="space-y-2">
          {recentTransactions.map((tx) => (
            <div 
              key={tx.id} 
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                isDark ? "bg-slate-900/60 border-slate-850 hover:bg-slate-900" : "bg-white border-slate-50 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  tx.type === "deposit" ? "bg-emerald-500/10 text-emerald-500" : 
                  tx.type === "withdrawal" ? "bg-blue-500/10 text-blue-500" :
                  tx.type === "recharge" ? "bg-sky-500/10 text-sky-500" : "bg-amber-500/10 text-amber-500"
                }`}>
                  {tx.type === "deposit" ? "IN" : tx.type === "withdrawal" ? "OUT" : tx.type === "recharge" ? "RC" : "BL"}
                </span>

                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold capitalize">
                      {tx.type === "deposit" ? t.cashIn : tx.type === "withdrawal" ? t.cashOut : tx.type === "recharge" ? t.recharge : t.billPay}
                    </p>
                    <span className="text-[8px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-400 py-0.5 px-1.5 rounded">
                      {tx.receiptNumber}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {tx.customerMobile} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold font-mono">
                  {tx.type === "withdrawal" ? "+" : "-"}{tx.amount} BDT
                </p>
                {tx.commissionEarned > 0 && (
                  <p className="text-[9px] font-bold text-emerald-500">
                    +{tx.commissionEarned} BDT Com.
                  </p>
                )}
              </div>
            </div>
          ))}

          {recentTransactions.length === 0 && (
            <p className="text-xs text-center text-slate-500 py-4">No recent transactions recorded.</p>
          )}
        </div>
      </div>

    </div>
  );
}
