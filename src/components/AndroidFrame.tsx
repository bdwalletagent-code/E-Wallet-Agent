import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  Signal, 
  Battery, 
  Settings, 
  Code, 
  Bell, 
  Volume2, 
  Moon, 
  Sun,
  Laptop
} from "lucide-react";

interface AndroidFrameProps {
  children: React.ReactNode;
  activeRole: "agent" | "admin";
  onRoleToggle: () => void;
  lang: "English" | "Bangla";
  onLangToggle: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  onOpenDevHub: () => void;
  notificationCount: number;
  agentStatus: "pending" | "approved" | "suspended";
}

export default function AndroidFrame({
  children,
  activeRole,
  onRoleToggle,
  lang,
  onLangToggle,
  isDark,
  onThemeToggle,
  onOpenDevHub,
  notificationCount,
  agentStatus
}: AndroidFrameProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative w-full h-full min-h-screen flex flex-col md:flex-row items-stretch overflow-hidden font-sans transition-colors duration-300 ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      
      {/* Simulation Helper Sidebar on Desktop for easy role switching, configuration, and logs */}
      <div className={`hidden lg:flex flex-col w-80 p-6 border-r shrink-0 justify-between ${isDark ? "border-slate-800 bg-slate-900/60" : "border-slate-200 bg-white"}`}>
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20">
              <Code size={20} />
            </span>
            <div>
              <h2 className="font-bold text-lg leading-tight tracking-tight">E-Wallet Agent</h2>
              <p className="text-xs text-slate-400">Android Simulation Console</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="p-4 rounded-xl border border-dashed text-xs space-y-2 border-slate-700 bg-slate-950/20">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Device:</span>
                <span className="font-semibold text-emerald-500">Android 14 (API 34)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Engine Build:</span>
                <span className="font-mono">Flutter 3.16.x SECURE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SDK Package:</span>
                <span className="font-mono text-blue-400">@google/genai & Firebase</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Simulate Admin Override</label>
              <div className={`p-1 rounded-xl flex items-center transition-all ${isDark ? "bg-slate-950" : "bg-slate-100"}`}>
                <button
                  id="toggle-role-agent-btn"
                  onClick={() => activeRole !== "agent" && onRoleToggle()}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeRole === "agent" ? "bg-emerald-600 text-white shadow-md" : "text-slate-400 hover:text-slate-300"}`}
                >
                  Agent Phone
                </button>
                <button
                  id="toggle-role-admin-btn"
                  onClick={() => activeRole !== "admin" && onRoleToggle()}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeRole === "admin" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-slate-300"}`}
                >
                  Super Admin Panel
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Quick System Controls</label>
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  id="sidebar-lang-btn"
                  onClick={onLangToggle} 
                  className={`p-3 rounded-xl border text-center text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${isDark ? "border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-slate-200" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}
                >
                  🌐 {lang === "English" ? "বাংলা" : "English"}
                </button>
                <button 
                  id="sidebar-theme-btn"
                  onClick={onThemeToggle} 
                  className={`p-3 rounded-xl border text-center text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${isDark ? "border-slate-800 bg-slate-950/40 hover:bg-slate-950 text-emerald-400" : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"}`}
                >
                  {isDark ? <Sun size={14} /> : <Moon size={14} />}
                  {isDark ? "Light View" : "Dark View"}
                </button>
              </div>

              <button 
                id="sidebar-export-hub-btn"
                onClick={onOpenDevHub} 
                className="w-full flex items-center justify-center gap-2 p-3 mt-2 rounded-xl bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-semibold text-xs tracking-wide shadow-lg hover:brightness-110 active:scale-95 transition-all text-center cursor-pointer"
              >
                <Code size={14} /> Export Flutter & Security Rules
              </button>
            </div>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Agent State</span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${agentStatus === "approved" ? "bg-emerald-500 animate-pulse" : agentStatus === "suspended" ? "bg-rose-500" : "bg-amber-500"}`} />
                <span className="text-xs font-medium capitalize">
                  {agentStatus}: {agentStatus === "approved" ? "Operational" : agentStatus === "suspended" ? "Suspended by Admin" : "Awaiting Verification"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-slate-500 text-[11px] leading-relaxed border-t border-slate-800 pt-4 space-y-1">
          <p>This developer console manages the React deployment, demonstrating both mobile views. Run on Android directly by downloading source from the exporter.</p>
          <p className="font-mono text-[10px]">Version 1.0.0 (Release APK Candidate)</p>
        </div>
      </div>

      {/* Main Responsive Mobile Viewport Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-0 md:p-6 lg:p-10 relative overflow-hidden">
        
        {/* Floating Tool Bar for Mobile screens to access Dev console trigger / Role switcher */}
        <div className="flex lg:hidden absolute top-3 left-3 right-3 z-50 bg-slate-900/90 text-white rounded-xl px-3 py-2 flex items-center justify-between shadow-lg backdrop-blur-md border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold font-sans tracking-wide">E-Wallet Agent</span>
          </div>
          <div className="flex items-center bg-slate-800 p-1 rounded-lg">
            <button 
              id="mobile-quick-role-btn"
              onClick={onRoleToggle} 
              className="text-[10px] px-2.5 py-1 bg-emerald-600 rounded-md font-semibold tracking-wider text-white"
            >
              {activeRole === "agent" ? "Switch to Super Admin" : "Switch to Agent"}
            </button>
          </div>
        </div>

        {/* Smartphone Outer Bezel & Shell */}
        <div className={`relative w-full h-full md:w-[410px] md:h-[840px] md:rounded-[48px] md:border-[10px] flex flex-col shadow-2xl transition-all duration-300 ${
          isDark 
            ? "md:border-slate-800 md:bg-slate-950 md:shadow-emerald-950/20" 
            : "md:border-slate-900 md:bg-white md:shadow-slate-300/40"
        } overflow-hidden`}>
          
          {/* Selfie Camera Notch */}
          <div className="hidden md:block absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-2xl z-50">
            <div className="absolute right-6 top-1.5 w-3 h-3 bg-slate-850 rounded-full border border-slate-700" />
            <div className="absolute left-1/2 top-2 transform -translate-x-1/2 w-6 h-1 bg-slate-800 rounded-full" />
          </div>

          {/* Android Clock & Status Bar */}
          <div id="android-status-bar" className={`w-full px-6 pt-3 md:pt-8 pb-2 flex items-center justify-between text-xs font-sans select-none z-40 transition-colors ${
            isDark ? "bg-slate-950 text-slate-200" : "bg-slate-50 text-slate-700"
          }`}>
            <span className="font-semibold tracking-tight">{time}</span>
            <div className="flex items-center gap-1.5">
              {notificationCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
              <Signal size={12} className="opacity-90" />
              <Wifi size={12} className="opacity-90" />
              <Battery size={14} className="opacity-90 font-bold" />
            </div>
          </div>

          {/* Device Operating System Web Screen Area */}
          <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col">
            {children}
          </div>

          {/* Android Home Navigation Gesture Pill Bar */}
          <div className={`w-full py-2 flex items-center justify-center z-40 ${
            isDark ? "bg-slate-950" : "bg-slate-50"
          }`}>
            <div className={`w-28 h-1 rounded-full transition-colors ${
              isDark ? "bg-slate-700 hover:bg-slate-600" : "bg-slate-300 hover:bg-slate-400"
            }`} />
          </div>

        </div>

      </div>

    </div>
  );
}
