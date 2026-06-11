import React, { useState, useMemo } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  ChevronRight, 
  Phone, 
  Calendar,
  X,
  CreditCard,
  FileCheck2,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { Customer, Transaction, Language } from "../types";
import { TRANSLATIONS } from "../data";

interface CustomersTabProps {
  customers: Customer[];
  transactions: Transaction[];
  lang: Language;
  onAddCustomer: (customerName: string, customerMobile: string) => { success: boolean; error?: string };
  isDark: boolean;
}

export default function CustomersTab({
  customers,
  transactions,
  lang,
  onAddCustomer,
  isDark
}: CustomersTabProps) {
  const t = TRANSLATIONS[lang];
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New customer field states
  const [newName, setNewName] = useState("");
  const [newMobile, setNewMobile] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Focus detail selected customer profile modal
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setSuccessMsg(null);

    if (!newName || newMobile.length < 11) {
      setErrorText("Validation Error: Please fill in the full customer name and valid 11-digit mobile.");
      return;
    }

    const res = onAddCustomer(newName, newMobile);
    if (res.success) {
      setSuccessMsg(`Success! '${newName}' registered in customer database.`);
      setNewName("");
      setNewMobile("");
      setTimeout(() => {
        setSuccessMsg(null);
        setShowAddForm(false);
      }, 2000);
    } else {
      setErrorText(res.error || "Execution Error");
    }
  };

  // Filtered customer listings
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.mobile.includes(search)
    );
  }, [customers, search]);

  // Deep customer profile analytics metrics
  const selectedProfileStats = useMemo(() => {
    if (!selectedCustomer) return null;
    const clientTx = transactions.filter(tx => tx.customerMobile === selectedCustomer.mobile && tx.status === "success");
    const totalVolume = clientTx.reduce((sum, tx) => sum + tx.amount, 0);
    
    return {
      history: clientTx,
      totalVolume,
      count: clientTx.length
    };
  }, [selectedCustomer, transactions]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      
      {/* Search Header and Action Toggle */}
      <div className={`p-4 border-b shrink-0 space-y-3 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base tracking-tight">{t.customers}</h3>
            <p className="text-[10px] text-slate-400">Manage client directory and ledger</p>
          </div>
          
          <button
            id="toggle-add-customer-form-btn"
            onClick={() => {
              setShowAddForm(!showAddForm);
              setErrorText(null);
              setSuccessMsg(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
              showAddForm 
                ? "bg-slate-800 text-slate-300" 
                : "bg-emerald-600 text-white shadow-lg shadow-emerald-600/10 hover:brightness-110"
            }`}
          >
            {showAddForm ? <X size={12} /> : <UserPlus size={12} />}
            {showAddForm ? "Cancel" : t.addCustomer}
          </button>
        </div>

        {!showAddForm && (
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search customers by name or 11-digit mobile..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full p-2.5 pl-9 rounded-2xl text-xs focus:outline-emerald-500 border ${
                isDark ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-20 scrollbar-none">
        
        {/* Real-time Registration Form Overlay / Row expansion */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className={`p-5 rounded-3xl border mt-3 space-y-3.5 transition-all animate-fade-in ${
            isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-sm"
          }`}>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <UserCheck size={14} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">New Client Register Wizard</span>
            </div>

            {errorText && (
              <p className="text-[10px] font-semibold text-rose-500 bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">{errorText}</p>
            )}
            {successMsg && (
              <p className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 animate-pulse">{successMsg}</p>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Full Client Name</span>
              <input
                type="text"
                placeholder="e.g. Md. Ashraful Islam"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className={`w-full p-2.5 rounded-2xl text-xs border focus:outline-emerald-500 ${
                  isDark ? "bg-slate-900 border-slate-850 text-slate-300" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Active Mobile Number</span>
              <input
                type="tel"
                placeholder="e.g. 017XXXXXXXX"
                value={newMobile}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  setNewMobile(cleaned);
                }}
                maxLength={11}
                className={`w-full p-2.5 rounded-2xl text-xs font-mono border focus:outline-emerald-500 ${
                  isDark ? "bg-slate-900 border-slate-850 text-slate-300" : "bg-slate-50 border-slate-200"
                }`}
              />
            </div>

            <button
              id="submit-new-customer-btn"
              type="submit"
              className="w-full py-2.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-lg rounded-xl hover:brightness-110 cursor-pointer"
            >
              Add into Register
            </button>
          </form>
        )}

        {/* Directory Row Listing */}
        {!showAddForm && (
          <div className="space-y-2 mt-4 animate-fade-in">
            {filteredCustomers.map((c) => (
              <div
                key={c.id}
                id={`customer-item-${c.id}`}
                onClick={() => setSelectedCustomer(c)}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                  isDark ? "bg-slate-900/40 border-slate-850 hover:bg-slate-900" : "bg-white border-slate-100 hover:bg-slate-50 shadow-sm"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center text-xs">
                    {c.name.split(" ").filter(Boolean).map(p => p[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold">{c.name}</h5>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500 font-mono">
                      <Phone size={10} className="text-slate-450" />
                      <span>{c.mobile}</span>
                    </div>
                  </div>
                </div>

                <ChevronRight size={14} className="text-slate-500 shrink-0" />
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <p className="text-xs text-center text-slate-500 py-10">No customer records found.</p>
            )}
          </div>
        )}

      </div>

      {/* Drill-Down Customer Profile Modal Popup Dialog */}
      {selectedCustomer && selectedProfileStats && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-[32px] p-6 border shadow-2xl relative ${
            isDark ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <button
              id="close-customer-profile-btn"
              onClick={() => setSelectedCustomer(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800/10 text-slate-400 cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col items-center mt-2 pb-4 border-b border-slate-800">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 font-extrabold flex items-center justify-center text-lg mb-2">
                {selectedCustomer.name.split(" ").filter(Boolean).map(p => p[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <h3 className="font-extrabold text-base tracking-tight">{selectedCustomer.name}</h3>
              <p className="text-xs text-emerald-500 font-mono font-bold">{selectedCustomer.mobile}</p>
              
              <div className="flex gap-2.5 items-center mt-2.5 text-[10px] text-slate-450 font-mono">
                <Calendar size={11} />
                <span>Client since {new Date(selectedCustomer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Micro statistical KPIs inside modal */}
            <div className="grid grid-cols-2 gap-2 my-4">
              <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-100"}`}>
                <p className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Processed Count</p>
                <div className="flex items-center justify-center gap-1.5 mt-1 font-mono font-black text-xs text-sky-400">
                  <CreditCard size={12} />
                  <span>{selectedProfileStats.count} tx</span>
                </div>
              </div>

              <div className={`p-3 rounded-2xl border text-center ${isDark ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-100"}`}>
                <p className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Processed Volume</p>
                <div className="flex items-center justify-center gap-1.5 mt-1 font-mono font-black text-xs text-emerald-500">
                  <TrendingUp size={12} />
                  <span>৳{selectedProfileStats.totalVolume.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Mini transaction history list */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">Activity trail</span>
              
              <div className="max-h-40 overflow-y-auto scrollbar-none space-y-1.5 pr-0.5">
                {selectedProfileStats.history.map((tx) => (
                  <div key={tx.id} className="p-2.5 rounded-xl bg-slate-950/20 border border-slate-850 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold capitalize text-[10px]">{tx.type}</span>
                      <p className="text-[9px] text-slate-500 mt-0.5 font-mono">{new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                    <span className="font-bold font-mono text-slate-200">-{tx.amount} BDT</span>
                  </div>
                ))}

                {selectedProfileStats.history.length === 0 && (
                  <p className="text-[10px] text-center text-slate-500 py-4">No logged operations completed with client.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
