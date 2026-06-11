import React, { useState } from "react";
import { 
  Building, 
  Smartphone, 
  Mail, 
  Lock, 
  User, 
  UserPlus, 
  LogIn, 
  Languages, 
  Globe, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Settings
} from "lucide-react";
import { isLiveFirebaseConfigured, currentConfig } from "../firebase";
import { Language, Agent } from "../types";

interface AuthScreenProps {
  lang: Language;
  onLangToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onAuthSuccess: (agentData: Agent & { email: string }) => void;
}


export default function AuthScreen({
  lang,
  onLangToggle,
  isDark,
  onThemeToggle,
  onAuthSuccess
}: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  // Custom config states
  const [customConfigText, setCustomConfigText] = useState(() => {
    const saved = localStorage.getItem("ewallet_firebase_config");
    return saved ? saved : JSON.stringify(currentConfig, null, 2);
  });

  const isLive = isLiveFirebaseConfigured;

  // Bangla translations
  const t = {
    title: lang === "English" ? "E-Wallet Agent" : "ই-ওয়ালেট এজেন্ট",
    subtitle: lang === "English" ? "Bangladeshi Digital Distribution Portal" : "বাংলাদেশী ডিজিটাল ডিস্ট্রিবিউশন পোর্টাল",
    loginTab: lang === "English" ? "Agent Login" : "এজেন্ট লগইন",
    registerTab: lang === "English" ? "Agent Register" : "এজেন্ট নিবন্ধন",
    nameLabel: lang === "English" ? "Full Name" : "এজেন্টের সম্পূর্ণ নাম",
    emailLabel: lang === "English" ? "Email Address" : "ইমেইল অ্যাড্রেস",
    mobileLabel: lang === "English" ? "Mobile Number (11 Digits)" : "মোবাইল নম্বর (১১ ডিজিট)",
    passwordLabel: lang === "English" ? "Secured Password" : "নিরাপত্তা পাসওয়ার্ড",
    referralLabel: lang === "English" ? "Referral Code (Optional)" : "রেফারেল কোড (ঐচ্ছিক)",
    submitLogin: lang === "English" ? "Secure Auth Entry" : "সুরক্ষিত লগইন করুন",
    submitRegister: lang === "English" ? "Create Agent Node" : "নতুন অ্যাকাউন্ট নিবন্ধন",
    toggleToRegister: lang === "English" ? "Don't have an account? Sign up" : "অ্যাকাউন্ট নেই? এখানে নিবন্ধন করুন",
    toggleToLogin: lang === "English" ? "Already registered? Login here" : "ইতিমধ্যেই নিবন্ধিত? লগইন করুন",
    configTitle: lang === "English" ? "Firebase Connection Configuration" : "ফায়ারবেস কানেকশন কনফিগারেশন",
    configHelp: lang === "English" ? "Connect your actual Firebase database rules to store information securely." : "তথ্যগুলো সঠিকভাবে সংরক্ষণ করতে আপনার নিজস্ব ফায়ারবেস কনফিগার কোডটি দিন।",
    sandboxMode: lang === "English" ? "Running in Mobile Sandbox Mode" : "মোবাইল স্যান্ডবক্স মোডে চলছে।",
    liveMode: lang === "English" ? "Live Firebase Active" : "লাইভ ফায়ারবেস সক্রিয় আছে",
    quickDemoText: lang === "English" ? "Click below for Instant Sandbox Access" : "সরাসরি স্যান্ডবক্স ডেমোতে প্রবেশ করতে নিচে চাপুন",
    sandboxAccessBtn: lang === "English" ? "Instant Sandbox Demo Access" : "স্যান্ডবক্স ডেমো সংযোগ করুন",
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email || !password) {
      setError(lang === "English" ? "Please fill in all email and password fields" : "অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড প্রদান করুন");
      setIsLoading(false);
      return;
    }

    if (!isLogin && (!name || !mobile)) {
      setError(lang === "English" ? "Name and valid mobile are required for signup" : "অ্যাকাউন্ট খুলতে নাম এবং মোবাইল নম্বর আবশ্যক");
      setIsLoading(false);
      return;
    }

    if (!isLogin && mobile.length !== 11) {
      setError(lang === "English" ? "Mobile number must be exactly 11 digits" : "মোবাইল নম্বর অবশ্যই ১১ ডিজিটের হতে হবে");
      setIsLoading(false);
      return;
    }

    try {
      if (isLive) {
        // --- REAL FIREBASE IMPLEMENTATION ---
        const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("firebase/auth");
        const { getFirestore, doc, setDoc, getDoc } = await import("firebase/firestore");
        const { db, auth } = await import("../firebase");

        if (!auth || !db) {
          throw new Error("Firebase SDK is not initialized correctly.");
        }

        if (isLogin) {
          // Live Firebase Sign in
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;

          // Fetch info from firestore agents collection
          const docRef = doc(db, "agents", uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            onAuthSuccess({
              agentId: uid,
              name: data.name || "Live Agent",
              mobile: data.mobile || "01700000000",
              status: data.status || ("pending" as const),
              walletBalance: data.walletBalance ?? 0.0,
              commissionBalance: data.commissionBalance ?? 0.0,
              referredBy: data.referredBy || null,
              referralCode: data.referralCode || "REG-" + uid.substring(0, 5).toUpperCase(),
              createdAt: data.createdAt || new Date().toISOString(),
              email: email
            });
          } else {
            // Document does not exist in agents but user authenticated successfully. Create a default record or alert.
            const newRefCode = "BDG" + mobile.substring(mobile.length - 6);
            const fallbackAgent = {
              agentId: uid,
              name: email.split("@")[0].toUpperCase(),
              mobile: "",
              status: "pending" as const,
              walletBalance: 0.0,
              commissionBalance: 0.0,
              referredBy: null,
              referralCode: newRefCode,
              createdAt: new Date().toISOString()
            };
            await setDoc(doc(db, "agents", uid), fallbackAgent);
            // Also save to users path
            await setDoc(doc(db, "users", uid), {
              uid,
              email,
              role: "agent",
              createdAt: new Date().toISOString()
            });

            onAuthSuccess({
              ...fallbackAgent,
              email
            });
          }
          setSuccess(lang === "English" ? "Welcome back! Node authorized" : "সফলভাবে লগইন হয়েছে! সিস্টেম অথরাইজড");
        } else {
          // Live Firebase Sign up
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;
          const cleanReferralCode = "BDG" + mobile.substring(mobile.length - 6);

          // Save User node
          await setDoc(doc(db, "users", uid), {
            uid,
            email,
            role: "agent" as const,
            createdAt: new Date().toISOString()
          });

          // Save Agent node
          const newAgentObj = {
            agentId: uid,
            name,
            mobile,
            status: "pending" as const, // Pending admin approval initially
            walletBalance: 0.0, // default welcome balance
            commissionBalance: 0.0,
            referredBy: referralCode ? referralCode : null,
            referralCode: cleanReferralCode,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, "agents", uid), newAgentObj);

          setSuccess(lang === "English" ? "Registration completed! Node awaiting Admin approval." : "নিবন্ধন সফল হয়েছে! অনুগ্রহ করে অ্যাডমিনের অনুমোদনের অপেক্ষা করুন");
          setTimeout(() => {
            onAuthSuccess({
              ...newAgentObj,
              email
            });
          }, 1500);
        }
      } else {
        // --- SANDBOX SIMULATED MODE ---
        await new Promise(resolve => setTimeout(resolve, 800));

        if (isLogin) {
          // Look inside current mock agents database
          const savedAgents = localStorage.getItem("ewallet_agents");
          const agentList = savedAgents ? JSON.parse(savedAgents) : [];
          
          // Let's match based on email or mobile prefix
          const targetAgent = agentList.find(
            (a: any) => a.mobile === email || eMailMatches(a.name, email)
          );

          if (targetAgent) {
            onAuthSuccess({
              ...targetAgent,
              commissionBalance: targetAgent.commissionBalance ?? 0.0,
              createdAt: targetAgent.createdAt || new Date().toISOString(),
              email: email.includes("@") ? email : `${targetAgent.mobile}@ewallet.com`
            });
          } else {
            // Default user fallback for demo entry
            const demoAgent = {
              agentId: "agent_1",
              name: "Tanveer Rahman",
              mobile: "01711223344",
              status: "approved" as const,
              walletBalance: 24500.50,
              commissionBalance: 1205.80,
              referredBy: null,
              referralCode: "BDG849102",
              createdAt: new Date().toISOString(),
              email: "agent@ewallet.com"
            };
            onAuthSuccess(demoAgent);
          }
        } else {
          // Register in sandbox database (persisted locally)
          const newAgentId = "agent_gen_" + Date.now();
          const cleanCode = "BDG" + mobile.substring(mobile.length - 6);
          const newAgentObj = {
            agentId: newAgentId,
            name,
            mobile,
            status: "pending" as const, // Starts as pending until Admin approves in Panel
            walletBalance: 0.0,
            commissionBalance: 0.0,
            referredBy: referralCode ? referralCode : null,
            referralCode: cleanCode,
            createdAt: new Date().toISOString()
          };

          // Save locally
          const savedAgents = localStorage.getItem("ewallet_agents");
          const agentList = savedAgents ? JSON.parse(savedAgents) : [];
          agentList.push(newAgentObj);
          localStorage.setItem("ewallet_agents", JSON.stringify(agentList));

          setSuccess(lang === "English" ? "Registered successfully in Sandbox!" : "স্যান্ডবক্স ডাটাবেসে সফলভাবে নিবন্ধিত হয়েছে!");
          setTimeout(() => {
            onAuthSuccess({
              ...newAgentObj,
              email: email
            });
          }, 1000);
        }
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Operation failed. Review authentication parameters.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSandboxDirectDemo = () => {
    // Quick login to bypass configuration for review
    const defaultAgent = {
      agentId: "agent_1",
      name: "Tanveer Rahman",
      mobile: "01711223344",
      status: "approved" as const,
      walletBalance: 24500.50,
      commissionBalance: 1205.80,
      referredBy: null,
      referralCode: "BDG849102",
      createdAt: new Date().toISOString(),
      email: "agent1@ewallet.com"
    };
    onAuthSuccess(defaultAgent);
  };


  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(customConfigText);
      if (!parsed.apiKey || parsed.apiKey.includes("Placeholder")) {
        alert("Please paste a valid Firebase Web configuration JSON.");
        return;
      }
      localStorage.setItem("ewallet_firebase_config", JSON.stringify(parsed));
      alert("Firebase Config updated successfully! Reloading connection node...");
      window.location.reload();
    } catch (err: any) {
      alert("Invalid JSON format. Please ensure you copied the entire firebaseConfig object template.");
    }
  };

  const handleResetConfig = () => {
    localStorage.removeItem("ewallet_firebase_config");
    alert("Firebase Config restored to default sandbox mode!");
    window.location.reload();
  };

  // Quick email name match helper
  const eMailMatches = (name: string, email: string) => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const cleanEmail = email.toLowerCase().split("@")[0];
    return cleanName.includes(cleanEmail) || cleanEmail.includes(cleanName);
  };

  return (
    <div className={`flex-1 flex flex-col justify-start overflow-y-auto px-5 pt-4 pb-12 scrollbar-none transition-colors ${
      isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* Brand Launcher Banner */}
      <div className="flex flex-col items-center text-center mt-3 mb-6">
        <div className="p-3.5 mb-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-xl shadow-emerald-500/10">
          <Database size={22} className="animate-pulse" />
        </div>
        <h2 className="font-sans font-black text-xl tracking-tight leading-none text-emerald-500">{t.title}</h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1 max-w-[280px] leading-tight">
          {t.subtitle}
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 p-1 mb-5 rounded-xl border border-slate-900 bg-slate-950/40">
        <button
          id="auth-tab-login"
          onClick={() => { setIsLogin(true); setError(""); setSuccess(""); }}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            isLogin ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.loginTab}
        </button>
        <button
          id="auth-tab-register"
          onClick={() => { setIsLogin(false); setError(""); setSuccess(""); }}
          className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            !isLogin ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/20" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {t.registerTab}
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2 items-start leading-snug">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex gap-2 items-start leading-snug">
          <CheckCircle2 size={14} className="shrink-0 mt-0.5 animate-bounce" />
          <span>{success}</span>
        </div>
      )}

      {/* Auth Input form */}
      <form onSubmit={handleAuthSubmit} className="space-y-3.5">
        
        {!isLogin && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t.nameLabel} *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500"><User size={14} /></span>
              <input
                id="auth-input-name"
                type="text"
                required
                placeholder="e.g. Md. Kamal Hossain"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-emerald-500 ${
                  isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-250"
                }`}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t.emailLabel} *</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500"><Mail size={14} /></span>
            <input
              id="auth-input-email"
              type="email"
              required
              placeholder="e.g. agent@ewallet.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-emerald-500 ${
                isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-250"
              }`}
            />
          </div>
        </div>

        {!isLogin && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t.mobileLabel} *</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500"><Smartphone size={14} /></span>
              <input
                id="auth-input-mobile"
                type="tel"
                required
                placeholder="e.g. 01711223344"
                maxLength={11}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-emerald-500 ${
                  isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-250"
                }`}
              />
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t.passwordLabel} *</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-500"><Lock size={14} /></span>
            <input
              id="auth-input-password"
              type="password"
              required
              minLength={6}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border focus:outline-emerald-500 ${
                isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-250"
              }`}
            />
          </div>
        </div>

        {!isLogin && (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{t.referralLabel}</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500"><Sparkles size={14} /></span>
              <input
                id="auth-input-referral"
                type="text"
                placeholder="e.g. BDG849102"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className={`w-full pl-9 pr-4 py-3 text-xs rounded-xl border focus:outline-emerald-500 ${
                  isDark ? "bg-slate-900 border-slate-850" : "bg-white border-slate-250"
                }`}
              />
            </div>
          </div>
        )}

        <button
          id="auth-submit-btn"
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-extrabold text-xs tracking-wider uppercase shadow-lg shadow-emerald-950/20 active:scale-98 transition-all hover:brightness-105 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isLogin ? (
            <><LogIn size={15} />{t.submitLogin}</>
          ) : (
            <><UserPlus size={15} />{t.submitRegister}</>
          )}
        </button>
      </form>

      {/* Switch auth mode toggle or fast launcher */}
      <div className="mt-4 text-center">
        <button
          id="auth-toggle-mode-btn"
          onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
          className="text-xs text-slate-400 hover:text-emerald-400 font-semibold cursor-pointer py-1"
        >
          {isLogin ? t.toggleToRegister : t.toggleToLogin}
        </button>
      </div>

      {/* Status Indicators & Direct Access */}
      <div className="mt-6 pt-5 border-t border-slate-900 space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isLive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="font-semibold text-slate-300">{isLive ? t.liveMode : t.sandboxMode}</span>
          </div>
          <button
            id="toggle-config-form-btn"
            onClick={() => setShowConfig(!showConfig)}
            className="text-[10px] font-bold text-slate-400 hover:text-emerald-400 uppercase tracking-wider flex items-center gap-1 transition-all"
          >
            <Settings size={11} /> Config
          </button>
        </div>

        {/* Dynamic Sandbox Access Shortcut */}
        {!isLive && (
          <div className={`p-4 rounded-2xl text-center border border-dashed transition-all ${
            isDark ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-300"
          }`}>
            <p className="text-[10px] text-slate-400 font-medium leading-normal mb-2.5">
              💡 {t.quickDemoText}
            </p>
            <button
              id="sandbox-demo-shortcut-btn"
              onClick={handleSandboxDirectDemo}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-[10px] font-bold hover:bg-slate-800 transition-all border border-slate-800 cursor-pointer shadow-sm shadow-black"
            >
              {t.sandboxAccessBtn}
            </button>
          </div>
        )}
      </div>

      {/* Firebase Developer Configuration Exporter block */}
      {showConfig && (
        <div className={`p-4 mt-5 rounded-2xl border text-xs space-y-3 animate-fade-in ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
        }`}>
          <h4 className="font-extrabold text-[11px] uppercase tracking-wider">{t.configTitle}</h4>
          <p className="text-[10px] text-slate-450 leading-relaxed">{t.configHelp}</p>
          
          <form onSubmit={handleSaveConfig} className="space-y-3">
            <textarea
              id="firebase-config-json-textarea"
              rows={6}
              value={customConfigText}
              onChange={(e) => setCustomConfigText(e.target.value)}
              placeholder="Paste Firebase Config Object here..."
              className="w-full p-2.5 font-mono text-[9px] rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 focus:outline-emerald-500"
            />
            
            <div className="flex gap-2">
              <button
                id="save-firebase-config-btn"
                type="submit"
                className="flex-1 py-1.5 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg uppercase tracking-wider transition-all cursor-pointer"
              >
                Connect Config
              </button>
              {localStorage.getItem("ewallet_firebase_config") && (
                <button
                  id="reset-firebase-config-btn"
                  type="button"
                  onClick={handleResetConfig}
                  className="px-3 py-1.5 text-[10px] font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-lg uppercase transition-all"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
