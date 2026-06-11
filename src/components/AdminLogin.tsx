import React, { useState } from "react";
import { ShieldCheck, Lock, User, LogIn, ChevronLeft, AlertCircle } from "lucide-react";
import { Language } from "../types";

interface AdminLoginProps {
  lang: Language;
  onLangToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLogin({
  lang,
  onLangToggle,
  isDark,
  onThemeToggle,
  onSuccess,
  onCancel
}: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Bangla translations
  const t = {
    title: lang === "English" ? "Super Admin Security" : "সুপার এডমিন সিকিউরিটি",
    subtitle: lang === "English" ? "Bangladesh Digital Distribution Hub" : "ডিজিটাল ডিস্ট্রিবিউশন এডমিন হাব",
    idLabel: lang === "English" ? "Super Admin Email" : "সুপার এডমিন ইমেইল",
    passLabel: lang === "English" ? "Super Admin Password" : "সুপার এডমিন পাসওয়ার্ড",
    idPlaceholder: lang === "English" ? "Enter email (e.g. bdwalletagent@gmail.com)" : "ইমেইল এড্রেস দিন (যেমন: bdwalletagent@gmail.com)",
    passPlaceholder: lang === "English" ? "Enter security password" : "সিকিউরিটি পাসওয়ার্ডটি দিন",
    submitBtn: lang === "English" ? "Unlock Console" : "কনসোল আনলক করুন",
    cancelBtn: lang === "English" ? "Return to Agent View" : "এজেন্ট পোর্টালে ফিরে যান",
    invalidCreds: lang === "English" 
      ? "Unauthorized credentials! Only authorized Super Admin is permitted." 
      : "ভুল ইমেইল বা পাসওয়ার্ড! শুধুমাত্র অনুমোদিত সুপার এডমিন প্রবেশ করতে পারবেন।",
    fieldReq: lang === "English" 
      ? "Please fill in all security fields." 
      : "সবগুলো নিরাপত্তা তথ্য ইনপুট করুন।"
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate small latency for immersive auth feel
    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password;

      if (cleanUser === "bdwalletagent@gmail.com" && cleanPass === "imran.nishu12") {
        setIsLoading(false);
        onSuccess();
      } else if (cleanUser === "bdwalletagent@gmail.com" && cleanPass === "Imran.nishu12") {
        setIsLoading(false);
        onSuccess();
      } else {
        setIsLoading(false);
        setError(t.invalidCreds);
      }
    }, 650);
  };

  return (
    <div className={`flex-1 flex flex-col justify-start overflow-y-auto px-5 pt-6 pb-12 transition-colors ${
      isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* Back Button */}
      <button
        id="admin-login-back-btn"
        onClick={onCancel}
        className="self-start flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-900 cursor-pointer"
      >
        <ChevronLeft size={14} /> {t.cancelBtn}
      </button>

      {/* Security Brand Header */}
      <div className="flex flex-col items-center text-center mt-6 mb-7">
        <div className="p-4 mb-3 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/10">
          <ShieldCheck size={28} className="animate-pulse" />
        </div>
        <h2 className="font-sans font-black text-xl tracking-tight leading-none text-blue-500">{t.title}</h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1.5">
          {t.subtitle}
        </p>
      </div>

      {/* Errors alert message */}
      {error && (
        <div id="admin-login-error" className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2 items-start leading-snug">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Auth Input form */}
      <form onSubmit={handleAdminAuth} className="space-y-4">
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">{t.idLabel} *</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500"><User size={14} /></span>
            <input
              id="admin-login-username-input"
              type="text"
              required
              placeholder={t.idPlaceholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-blue-500 ${
                isDark ? "bg-slate-900 border-slate-850 text-white" : "bg-white border-slate-250 text-slate-900"
              }`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-450 block">{t.passLabel} *</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500"><Lock size={14} /></span>
            <input
              id="admin-login-password-input"
              type="password"
              required
              placeholder={t.passPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-blue-500 ${
                isDark ? "bg-slate-900 border-slate-850 text-white" : "bg-white border-slate-250 text-slate-900"
              }`}
            />
          </div>
        </div>

        <button
          id="admin-login-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-blue-950/20 active:scale-98 transition-all hover:brightness-105 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <><LogIn size={15} />{t.submitBtn}</>
          )}
        </button>
      </form>

      {/* Info Warning Footer Banner */}
      <div className={`p-3 rounded-xl mt-8 border leading-snug text-[10px] ${
        isDark ? "bg-slate-950 border-slate-900 text-slate-500" : "bg-slate-100 border-slate-200 text-slate-600"
      }`}>
        🔒 {lang === "English" 
          ? "This is a restricted operational segment. All session logins are recorded and monitored." 
          : "এটি একটি সংরক্ষিত প্রশাসনিক অঞ্চল। সমস্ত লগইন সেশন আইপি সহ পর্যবেক্ষণ করা হচ্ছে।"}
      </div>

    </div>
  );
}
