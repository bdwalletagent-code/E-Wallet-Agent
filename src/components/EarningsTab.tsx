import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Share2, 
  Award, 
  HelpCircle, 
  AlertCircle,
  Copy,
  Users,
  CheckCircle,
  CheckCircle2,
  DollarSign
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";
import { Transaction, Referral, Agent, Language } from "../types";
import { TRANSLATIONS } from "../data";

interface EarningsTabProps {
  agent: Agent;
  transactions: Transaction[];
  referrals: Referral[];
  lang: Language;
  onAddReferral: (referredName: string, referredMobile: string) => void;
  isDark: boolean;
}

export const EARNINGS_PRESET_CHART_DATA = [
  { day: "06-03", earnings: 450 },
  { day: "06-04", earnings: 220 },
  { day: "06-05", earnings: 510 },
  { day: "06-06", earnings: 300 },
  { day: "06-07", earnings: 620 },
  { day: "06-08", earnings: 340 },
  { day: "06-09", earnings: 480 } // Today simulated
];

export default function EarningsTab({
  agent,
  transactions,
  referrals,
  lang,
  onAddReferral,
  isDark
}: EarningsTabProps) {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);
  
  // Referral form states
  const [referredName, setReferredName] = useState("");
  const [referredMobile, setReferredMobile] = useState("");
  const [refSuccessMsg, setRefSuccessMsg] = useState<string | null>(null);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(agent.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setRefSuccessMsg(null);

    if (!referredName || referredMobile.length < 11) {
      alert("Please provide complete name and phone number");
      return;
    }

    onAddReferral(referredName, referredMobile);
    setRefSuccessMsg(`Success! Invited '${referredName}' with referral code '${agent.referralCode}'. Pending administration approval.`);
    setReferredName("");
    setReferredMobile("");
    setTimeout(() => setRefSuccessMsg(null), 5000);
  };

  // Performance calculations
  const stats = useMemo(() => {
    const todayDateStr = "2026-06-09";
    
    const todayTx = transactions.filter(tx => tx.timestamp.startsWith(todayDateStr));
    const todayCommission = todayTx.reduce((sum, tx) => sum + tx.commissionEarned, 0);

    const monthTx = transactions.filter(tx => tx.timestamp.includes("-06-"));
    const monthlyCommission = monthTx.reduce((sum, tx) => sum + tx.commissionEarned, 0);

    const totalTxCommission = transactions.reduce((sum, tx) => sum + tx.commissionEarned, 0);
    const referralEarned = referrals
      .filter(rf => rf.status === "rewarded")
      .reduce((sum, rf) => sum + rf.rewardAmount, 0);

    return {
      today: todayCommission,
      monthly: monthlyCommission,
      total: totalTxCommission + referralEarned,
      referralCount: referrals.length,
      rewardedReferralCount: referrals.filter(r => r.status === "rewarded").length,
      payoutPending: referrals.filter(r => r.status === "pending_approval").length * 500
    };
  }, [transactions, referrals]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pb-20 scrollbar-none px-4">
      
      {/* Title */}
      <div className="py-4">
        <h3 className="font-extrabold text-lg tracking-tight">Earnings Hub</h3>
        <p className="text-xs text-slate-400">Yield and referral commission management</p>
      </div>

      {/* Grid Stats Block */}
      <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
        <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-50 shadow-sm"}`}>
          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">{t.todayEarnings}</p>
          <p className="text-sm font-black font-mono text-emerald-500 mt-1">৳{stats.today}</p>
        </div>
        <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-50 shadow-sm"}`}>
          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">{t.monthlyEarnings}</p>
          <p className="text-sm font-black font-mono text-slate-100 mt-1">৳{stats.monthly}</p>
        </div>
        <div className={`p-3 rounded-2xl border ${isDark ? "bg-slate-900/60 border-slate-850" : "bg-white border-slate-50 shadow-sm"}`}>
          <p className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">{t.totalEarnings}</p>
          <p className="text-sm font-black font-mono text-cyan-400 mt-1">৳{stats.total}</p>
        </div>
      </div>

      {/* Interactive Micro Area Graph (Commission Over Time) */}
      <div className={`p-4 rounded-3xl border mb-6 ${
        isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-150 shadow-sm"
      }`}>
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUp size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Commission Growth Grid</span>
        </div>

        <div className="w-full h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={EARNINGS_PRESET_CHART_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
              <defs>
                <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? "#0f172a" : "#ffffff", 
                  borderColor: isDark ? "#334155" : "#e2e8f0",
                  borderRadius: "12px",
                  fontSize: "11px"
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="earnings" 
                stroke="#10b981" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorEarnings)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Referral Program Section */}
      <div className="space-y-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Award size={16} className="text-amber-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">{t.referAndEarn}</h4>
        </div>

        {/* Copy Referral Code card */}
        <div className={`p-4 rounded-3xl border flex items-center justify-between transition-all ${
          isDark ? "bg-slate-900/50 border-slate-850" : "bg-amber-50/25 border-amber-100"
        }`}>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">My Invitation Code</p>
            <p className="text-lg font-black tracking-widest font-mono mt-0.5 text-amber-500">{agent.referralCode}</p>
          </div>
          <button
            id="copy-referral-code-btn"
            onClick={handleCopyCode}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              copied ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Invite Referral Form */}
        <form onSubmit={handleInvite} className={`p-5 rounded-3xl border space-y-3.5 transition-all ${
          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Invite New Agent</span>

          {refSuccessMsg && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-2 items-start text-[11px] text-emerald-300 animate-fade-in">
              <CheckCircle2 size={13} className="shrink-0 text-emerald-500 mt-0.5" />
              <span>{refSuccessMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Future Agent Name</span>
            <input
              type="text"
              placeholder="e.g. Shakil Ahmed"
              value={referredName}
              onChange={(e) => setReferredName(e.target.value)}
              className={`w-full p-2.5 rounded-2xl text-xs border focus:outline-emerald-500 ${
                isDark ? "bg-slate-900 border-slate-850 text-slate-300" : "bg-slate-50 border-slate-200"
              }`}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Future Agent Mobile</span>
            <input
              type="tel"
              placeholder="e.g. 018XXXXXXXX"
              value={referredMobile}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "");
                setReferredMobile(cleaned);
              }}
              maxLength={11}
              className={`w-full p-2.5 rounded-2xl text-xs font-mono border focus:outline-emerald-500 ${
                isDark ? "bg-slate-900 border-slate-850 text-slate-300" : "bg-slate-50 border-slate-200"
              }`}
            />
          </div>

          <button
            id="submit-invite-btn"
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 cursor-pointer transition-all text-center"
          >
            Send Invitation Ticket
          </button>
        </form>

        {/* Referred list status */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Referral Registry</span>
          
          {referrals.map((rf) => (
            <div
              key={rf.id}
              className={`p-3 rounded-2xl border flex items-center justify-between ${
                isDark ? "bg-slate-900/30 border-slate-850" : "bg-white border-slate-50 shadow-sm"
              }`}
            >
              <div>
                <p className="text-xs font-bold">{rf.referredAgentName}</p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-slate-500 font-mono">
                  <span>Referred on {new Date(rf.timestamp).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  rf.status === "rewarded" 
                    ? "bg-emerald-500/10 text-emerald-400" 
                    : "bg-amber-500/10 text-amber-500 animate-pulse"
                }`}>
                  {rf.status === "rewarded" ? "+500 BDT Payout" : "Pending Approval"}
                </span>
              </div>
            </div>
          ))}

          {referrals.length === 0 && (
            <p className="text-xs text-center text-slate-500 py-3">No invites generated yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}
