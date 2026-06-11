import React, { useState } from "react";
import { 
  FileCode, 
  Folder, 
  ChevronRight, 
  Copy, 
  CheckCircle, 
  BookOpen, 
  Terminal, 
  Layers, 
  ShieldCheck, 
  CheckCircle2,
  X
} from "lucide-react";
import { FLUTTER_PROJECT, FlutterFile } from "../flutter_source";

interface DevHubProps {
  onClose: () => void;
  isDark: boolean;
}

export default function DevHub({ onClose, isDark }: DevHubProps) {
  const [selectedFile, setSelectedFile] = useState<FlutterFile>(FLUTTER_PROJECT[1]); // Default to main.dart
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-hidden font-sans">
      
      <div className={`w-full max-w-5xl h-[90vh] rounded-[36px] border flex flex-col md:flex-row overflow-hidden shadow-2xl transition-all ${
        isDark ? "bg-slate-950 border-slate-850 text-slate-100" : "bg-white border-slate-200 text-slate-900"
      }`}>
        
        {/* Left Side File Tree Explorer */}
        <div className={`w-full md:w-80 border-r flex flex-col shrink-0 ${
          isDark ? "bg-slate-900/40 border-slate-850" : "bg-slate-5.0 border-slate-200"
        }`}>
          {/* Header */}
          <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base tracking-tight text-emerald-500">Flutter Dev Cabin</h2>
              <p className="text-[10px] text-slate-400 font-mono">SDK BUILD EXPORTER</p>
            </div>
            
            <button
              id="close-devhub-btn"
              onClick={onClose}
              className="p-1 px-2 text-xs font-bold leading-tight bg-slate-850 hover:bg-slate-800 rounded-lg text-slate-400 uppercase tracking-widest cursor-pointer md:hidden"
            >
              Close
            </button>
          </div>

          {/* Directory Sections */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-none">
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                <Folder size={11} />
                <span>Base configurations</span>
              </div>
              
              {FLUTTER_PROJECT.filter(f => f.path.includes("pubspec.yaml") || f.path.includes("GUIDE")).map((file) => (
                <button
                  key={file.name}
                  id={`devhub-file-btn-${file.name.replace(/\s+/g, "-")}`}
                  onClick={() => {
                    setSelectedFile(file);
                    setCopied(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    selectedFile.name === file.name
                      ? "bg-emerald-600 text-white font-bold"
                      : isDark ? "hover:bg-slate-900/60 text-slate-350" : "hover:bg-slate-200 text-slate-700 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode size={13} className="shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <ChevronRight size={11} className="shrink-0 opacity-60" />
                </button>
              ))}
            </div>

            <div className="h-px bg-slate-800/50" />

            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                <Folder size={11} />
                <span>Dart lib source files</span>
              </div>
              
              {FLUTTER_PROJECT.filter(f => f.path.startsWith("lib/") && !f.path.includes("GUIDE")).map((file) => (
                <button
                  key={file.name}
                  id={`devhub-file-btn-${file.name.replace(/\s+/g, "-")}`}
                  onClick={() => {
                    setSelectedFile(file);
                    setCopied(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    selectedFile.name === file.name
                      ? "bg-emerald-600 text-white font-bold"
                      : isDark ? "hover:bg-slate-900/60 text-slate-350" : "hover:bg-slate-200 text-slate-700 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode size={13} className="shrink-0" />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <ChevronRight size={11} className="shrink-0 opacity-60" />
                </button>
              ))}
            </div>

            <div className="h-px bg-slate-800/50" />

            {/* General Android package information details */}
            <div className="p-3.5 rounded-2xl bg-slate-950/20 border border-slate-850 space-y-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block font-mono">APK Compilation Ready</span>
              <p className="text-[10px] leading-relaxed text-slate-500">
                These Dart components map cleanly with standard Android Gradle compiles. Integrate them into any IDE like IntelliJ or Android Studio to sideload packages.
              </p>
            </div>

          </div>
        </div>

        {/* Right Side Source Viewer & Quick copy console */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Header */}
          <div className={`p-5 border-b flex justify-between items-center ${
            isDark ? "bg-slate-950 border-slate-855" : "bg-white border-slate-200"
          }`}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">Target file:</span>
                <span className="text-xs font-mono font-bold text-emerald-400 truncate">{selectedFile.path}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 truncate uppercase font-mono">Format: Flutter SDK {selectedFile.language}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="devhub-copy-source-btn"
                onClick={handleCopy}
                className={`py-1.5 px-3.5 rounded-xl text-xs font-bold leading-none flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied 
                    ? "bg-emerald-500/10 text-emerald-500" 
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                {copied ? <CheckCircle size={13} /> : <Copy size={13} />}
                {copied ? "Copied Source" : "Copy Source"}
              </button>

              <button
                id="devhub-desktop-close-btn"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-300 cursor-pointer hidden md:block"
                title="Exit Dev Hub"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Actual Source code presentation */}
          <div className="flex-1 overflow-auto bg-slate-950 p-6 select-text text-slate-300 font-mono text-xs leading-relaxed scrollbar-thin">
            <pre className="whitespace-pre p-1.5 focus:outline-none">{selectedFile.content}</pre>
          </div>

        </div>

      </div>

    </div>
  );
}
