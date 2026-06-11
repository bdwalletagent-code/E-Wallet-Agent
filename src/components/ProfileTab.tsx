import React, { useState } from "react";
import { 
  User, 
  MapPin, 
  ShieldAlert, 
  KeyRound, 
  Smartphone, 
  LogOut, 
  Languages, 
  Moon, 
  Sun,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from "lucide-react";
import { Agent, Language } from "../types";
import { TRANSLATIONS } from "../data";

interface ProfileTabProps {
  agent: Agent;
  lang: Language;
  onLangToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onLogout: () => void;
  onResetDatabase: () => void; // Restores local sandbox records to start state
}

export default function ProfileTab({
  agent,
  lang,
  onLangToggle,
  isDark,
  onThemeToggle,
  onLogout,
  onResetDatabase
}: ProfileTabProps) {
  const t = TRANSLATIONS[lang];

  // Change password simulation state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);

  // Security guard states
  const [twoFactor, setTwoFactor] = useState(true);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPass && newPass) {
      setPassSuccess(true);
      setOldPass("");
      setNewPass("");
      setTimeout(() => {
        setPassSuccess(false);
        setShowPasswordForm(false);
      }, 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto pb-20 scrollbar-none px-4">
      
      {/* Profile Header Card */}
      <div className="flex flex-col items-center py-6 text-center">
        <div className="relative mb-3">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white font-black flex items-center justify-center text-2xl shadow-xl shadow-emerald-900/10">
            {agent.name.split(" ").filter(Boolean).map(p => p[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <span className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-550 border-2 border-slate-900 text-white shrink-0">
            <ShieldCheck size={12} />
          </span>
        </div>

        <h3 className="font-extrabold text-lg tracking-tight">{agent.name}</h3>
        <p className="text-xs text-emerald-500 font-mono font-bold mt-0.5">{agent.mobile}</p>
        
        <div className="mt-2.5 flex items-center gap-1 text-[10px] uppercase font-bold px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
          {t.approved} Agent Node
        </div>
      </div>

      {/* Account Profile Specifics */}
      <div className="space-y-4">
        
        {/* Core Localization System Config list */}
        <div className={`p-4 rounded-3xl border space-y-3 transition-all ${
          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Preference Dashboard</span>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <Languages size={15} className="text-slate-450" />
              <span className="text-xs font-semibold">Switch App Pack Language</span>
            </div>
            
            <button
              id="profile-lang-toggle-btn"
              onClick={onLangToggle}
              className="py-1 px-3 rounded-lg bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 text-xs font-bold transition-all cursor-pointer"
            >
              {lang === "English" ? "বাংলা (Bangla)" : "English (ENG)"}
            </button>
          </div>

          <div className="h-px bg-slate-900" />

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              {isDark ? <Moon size={15} className="text-slate-450" /> : <Sun size={15} className="text-slate-450" />}
              <span className="text-xs font-semibold">Visual Layout Style</span>
            </div>

            <button
              id="profile-theme-toggle-btn"
              onClick={onThemeToggle}
              className="py-1 px-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              {isDark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>

        {/* Dynamic Pass Modifier collapsible menu */}
        <div className={`p-4 rounded-3xl border space-y-3 transition-all ${
          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Node Credentials</span>

          <button
            id="collapsible-password-form-btn"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="w-full flex items-center justify-between py-1 text-left cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <KeyRound size={15} className="text-slate-450" />
              <span className="text-xs font-semibold">Change Security Password</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-bold uppercase">{showPasswordForm ? "Close Form" : "Expand"}</span>
          </button>

          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="pt-2 space-y-3 border-t border-slate-900 animate-fade-in">
              {passSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex gap-2 items-center text-[10px] text-emerald-300">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>Password changed dynamically! Ready in next Firebase sessions.</span>
                </div>
              )}
              
              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450">Active Password</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className={`w-full p-2 rounded-xl text-xs border focus:outline-emerald-500 ${
                    isDark ? "bg-slate-900 border-slate-850" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-450">Future Password</span>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className={`w-full p-2 rounded-xl text-xs border focus:outline-emerald-500 ${
                    isDark ? "bg-slate-900 border-slate-850" : "bg-slate-50 border-slate-200"
                  }`}
                />
              </div>

              <button
                id="submit-password-change-btn"
                type="submit"
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] tracking-wider uppercase cursor-pointer transition-all text-center"
              >
                Set New Passcode
              </button>
            </form>
          )}
        </div>

        {/* 2FA and Security Telemetry indicators */}
        <div className={`p-4 rounded-3xl border space-y-3 transition-all ${
          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"
        }`}>
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Android Node Telemetry</span>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <Smartphone size={15} className="text-slate-450" />
              <div>
                <span className="text-xs font-semibold block">Two-Factor Haptic (MFA)</span>
                <span className="text-[9px] text-slate-500 block">Requires PIN triggers before payouts</span>
              </div>
            </div>

            <button
              id="profile-mfa-toggle-btn"
              onClick={() => setTwoFactor(!twoFactor)}
              className={`py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                twoFactor 
                  ? "bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {twoFactor ? "ONLINE" : "OFFLINE"}
            </button>
          </div>

          <div className="h-px bg-slate-900" />

          <div className="flex items-center gap-2.5 text-[11px] text-slate-400 pb-1">
            <ShieldAlert size={14} className="text-sky-500" />
            <span>Fingerprint scanner synced with Samsung Knox API</span>
          </div>
        </div>

        {/* Sandbox database resetting utility */}
        <button
          id="profile-reset-db-btn"
          onClick={() => {
            if (confirm("Are you sure you want to reset all transaction histories, referrals, and agent balances in this local sandbox simulator?")) {
              onResetDatabase();
              alert("All database seed parameters restored successfully.");
            }
          }}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed text-xs font-extrabold text-amber-500 bg-amber-500/5 hover:bg-amber-500/10 select-none cursor-pointer transition-all"
        >
          <Trash2 size={13} /> Clear Client Storage (DB Reset)
        </button>

        {/* Sign out node simulation action */}
        <button
          id="profile-session-logout-btn"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl text-xs font-black uppercase tracking-wider bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 select-none cursor-pointer transition-all"
        >
          <LogOut size={14} /> Close Node Session (Logout)
        </button>

      </div>

    </div>
  );
}
