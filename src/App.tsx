import React, { useState, useEffect, useMemo } from "react";
import { 
  Building, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PhoneCall, 
  FileText, 
  Bell, 
  Volume2, 
  Moon, 
  Sun,
  Code,
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserCheck
} from "lucide-react";

// Context & Types
import { 
  UserRole, 
  AgentStatus, 
  TransactionType, 
  Language, 
  MainTab, 
  Agent, 
  Customer, 
  Transaction, 
  Referral, 
  Notification,
  AgentCashRequest
} from "./types";

import { 
  TRANSLATIONS, 
  INITIAL_CUSTOMERS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_REFERRALS, 
  INITIAL_NOTIFICATIONS 
} from "./data";

// Sub-components
import AndroidFrame from "./components/AndroidFrame";
import DashboardTab from "./components/DashboardTab";
import TransactionsTab from "./components/TransactionsTab";
import EarningsTab from "./components/EarningsTab";
import CustomersTab from "./components/CustomersTab";
import ProfileTab from "./components/ProfileTab";
import AdminPanel from "./components/AdminPanel";
import DevHub from "./components/DevHub";
import AuthScreen from "./components/AuthScreen";
import { isLiveFirebaseConfigured } from "./firebase";
import AdminLogin from "./components/AdminLogin";

export default function App() {
  // Authentication tracking
  const [loggedInAgent, setLoggedInAgent] = useState<Agent | null>(() => {
    const saved = localStorage.getItem("ewallet_loggedInAgent");
    if (saved) return JSON.parse(saved);
    return null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("ewallet_isAdminAuthenticated") === "true";
  });

  // 1. Unified Reactive Database Seed & LocalStorage Engine
  const [agents, setAgents] = useState<Agent[]>(() => {
    const saved = localStorage.getItem("ewallet_agents");
    if (saved) return JSON.parse(saved);
    return [
      {
        agentId: "agent_1",
        name: "Tanveer Rahman",
        mobile: "01711223344",
        status: "approved",
        walletBalance: 24500.50,
        commissionBalance: 1250.00,
        referredBy: null,
        referralCode: "BDG849102",
        createdAt: "2026-05-15T08:00:00Z"
      },
      {
        agentId: "agent_new_1",
        name: "Mahmudul Hasan (Savar)",
        mobile: "01822334455",
        status: "approved",
        walletBalance: 0.0,
        commissionBalance: 0.0,
        referredBy: "BDG849102",
        referralCode: "BDG529184",
        createdAt: "2026-06-05T12:00:00Z"
      },
      {
        agentId: "agent_new_2",
        name: "Sharmin Akhter (Sylhet)",
        mobile: "01933445566",
        status: "pending",
        walletBalance: 0.0,
        commissionBalance: 0.0,
        referredBy: "BDG849102",
        referralCode: "BDG401928",
        createdAt: "2026-06-08T16:30:00Z"
      }
    ];
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem("ewallet_customers");
    if (saved) return JSON.parse(saved);
    return INITIAL_CUSTOMERS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("ewallet_transactions");
    if (saved) return JSON.parse(saved);
    return INITIAL_TRANSACTIONS;
  });

  const [referrals, setReferrals] = useState<Referral[]>(() => {
    const saved = localStorage.getItem("ewallet_referrals");
    if (saved) return JSON.parse(saved);
    return INITIAL_REFERRALS;
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem("ewallet_notifications");
    if (saved) return JSON.parse(saved);
    return INITIAL_NOTIFICATIONS;
  });

  const [agentCashRequests, setAgentCashRequests] = useState<any[]>(() => {
    const saved = localStorage.getItem("ewallet_agentCashRequests");
    if (saved) return JSON.parse(saved);
    return [];
  });

  const [globalPoolDeposits, setGlobalPoolDeposits] = useState<number>(() => {
    const saved = localStorage.getItem("ewallet_globalPoolDeposits");
    return saved !== null ? parseInt(saved, 10) : 200;
  });

  const [globalPoolWithdrawals, setGlobalPoolWithdrawals] = useState<number>(() => {
    const saved = localStorage.getItem("ewallet_globalPoolWithdrawals");
    return saved !== null ? parseInt(saved, 10) : 200;
  });

  // State persist sync hook
  useEffect(() => {
    localStorage.setItem("ewallet_agents", JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem("ewallet_customers", JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem("ewallet_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("ewallet_referrals", JSON.stringify(referrals));
  }, [referrals]);

  useEffect(() => {
    localStorage.setItem("ewallet_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("ewallet_agentCashRequests", JSON.stringify(agentCashRequests));
  }, [agentCashRequests]);

  useEffect(() => {
    localStorage.setItem("ewallet_globalPoolDeposits", String(globalPoolDeposits));
  }, [globalPoolDeposits]);

  useEffect(() => {
    localStorage.setItem("ewallet_globalPoolWithdrawals", String(globalPoolWithdrawals));
  }, [globalPoolWithdrawals]);

  // 2. Telemetry configurations
  const [role, setRole] = useState<UserRole>("agent");
  const [lang, setLang] = useState<Language>("English");
  const [isDark, setIsDark] = useState(true);
  const [devHubOpen, setDevHubOpen] = useState(false);
  const [navTab, setNavTab] = useState<MainTab>("dashboard");
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Quick Launcher preset state
  const [launchPreset, setLaunchPreset] = useState<TransactionType | undefined>(undefined);

  // Active authenticated agent (matches loggedInAgent, or falls back to first agent in list)
  const currentAgent = useMemo(() => {
    if (loggedInAgent) {
      const found = agents.find(a => a.agentId === loggedInAgent.agentId);
      return found || loggedInAgent;
    }
    return agents[0];
  }, [agents, loggedInAgent]);

  // Dynamic notification counts
  const unreadNotificationCount = useMemo(() => {
    const agId = currentAgent?.agentId || "agent_1";
    return notifications.filter(n => !n.read && (n.recipientAgentId === null || n.recipientAgentId === agId)).length;
  }, [notifications, currentAgent]);

  // Translate labels
  const t = TRANSLATIONS[lang];

  // 3. SECURE FIREBASE LIVE INTEGRATION HOOKS
  // Listen for the authenticated user in Live Mode
  useEffect(() => {
    if (isLiveFirebaseConfigured) {
      const initLiveAuth = async () => {
        try {
          const { auth, db } = await import("./firebase");
          const { onAuthStateChanged } = await import("firebase/auth");
          const { doc, getDoc } = await import("firebase/firestore");

          if (auth && db) {
            return onAuthStateChanged(auth, async (user) => {
              if (user) {
                // Fetch info from firestore agents collection
                const docRef = doc(db, "agents", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                  const data = docSnap.data();
                  const agentObj: Agent = {
                    agentId: user.uid,
                    name: data.name || "Live Agent",
                    mobile: data.mobile || "01700000000",
                    status: data.status || "pending",
                    walletBalance: data.walletBalance ?? 0.0,
                    commissionBalance: data.commissionBalance ?? 0.0,
                    referredBy: data.referredBy || null,
                    referralCode: data.referralCode || "REG-" + user.uid.substring(0, 5).toUpperCase(),
                    createdAt: data.createdAt || new Date().toISOString()
                  };
                  setLoggedInAgent(agentObj);
                  localStorage.setItem("ewallet_loggedInAgent", JSON.stringify(agentObj));
                }
              } else {
                setLoggedInAgent(null);
                localStorage.removeItem("ewallet_loggedInAgent");
              }
            });
          }
        } catch (e) {
          console.error("Live Auth subscription failed:", e);
        }
      };
      let unsub: any;
      initLiveAuth().then(res => { unsub = res; });
      return () => { if (unsub) unsub(); };
    }
  }, []);

  // Sync real-time Firestore collection changes if Config is fully live
  useEffect(() => {
    if (isLiveFirebaseConfigured && loggedInAgent) {
      const syncCollections = async () => {
        try {
          const { db } = await import("./firebase");
          const { collection, onSnapshot } = await import("firebase/firestore");
          if (db) {
            // Live synchronizers
            const unsubAgents = onSnapshot(collection(db, "agents"), (snap) => {
              const list: Agent[] = [];
              snap.forEach(doc => list.push({ ...doc.data(), agentId: doc.id } as Agent));
              if (list.length > 0) setAgents(list);
            });

            const unsubCustomers = onSnapshot(collection(db, "customers"), (snap) => {
              const list: Customer[] = [];
              snap.forEach(doc => list.push({ ...doc.data(), id: doc.id } as Customer));
              if (list.length > 0) setCustomers(list);
            });

            const unsubTransactions = onSnapshot(collection(db, "transactions"), (snap) => {
              const list: Transaction[] = [];
              snap.forEach(doc => list.push({ ...doc.data(), id: doc.id } as Transaction));
              if (list.length > 0) {
                setTransactions(list.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
              }
            });

            const unsubReferrals = onSnapshot(collection(db, "referrals"), (snap) => {
              const list: Referral[] = [];
              snap.forEach(doc => list.push({ ...doc.data(), id: doc.id } as Referral));
              if (list.length > 0) setReferrals(list);
            });

            const unsubNotifications = onSnapshot(collection(db, "notifications"), (snap) => {
              const list: Notification[] = [];
              snap.forEach(doc => list.push({ ...doc.data(), id: doc.id } as Notification));
              if (list.length > 0) setNotifications(list);
            });

            return () => {
              unsubAgents();
              unsubCustomers();
              unsubTransactions();
              unsubReferrals();
              unsubNotifications();
            };
          }
        } catch (err) {
          console.error("Firestore synchronizers failed:", err);
        }
      };
      let unsubAll: any;
      syncCollections().then(un => { unsubAll = un; });
      return () => { if (unsubAll) unsubAll(); };
    }
  }, [loggedInAgent]);

  // Fallback diagnostic verify connection
  useEffect(() => {
    if (!isLiveFirebaseConfigured) {
      console.log("⚡ [Firebase Invariant] Sandbox simulation verified.");
    }
  }, []);


  // 4. TRANSACTION ENGINE IMPLEMENTATION
  const handleExecuteTransaction = (tx: {
    customerMobile: string;
    type: TransactionType;
    amount: number;
    operator?: string;
    billType?: string;
  }) => {
    // Re-verify Agent authorization state
    if (currentAgent.status !== "approved") {
      return { success: false, error: "Authentication Refused: Agent node suspended or pending." };
    }

    // Rate calculations
    let rate = 0;
    if (tx.type === "deposit") rate = 0.05; // 5%
    else if (tx.type === "withdrawal") rate = 0.03; // 3%

    const commission = tx.amount * rate;

    // Direct capital controls for instant products
    if (tx.type === "recharge" || tx.type === "bill_pay") {
      if (currentAgent.walletBalance < tx.amount) {
        return { success: false, error: "Processing Canceled: Insufficient wallet balance." };
      }
    } else if (tx.type === "agent_withdraw") {
      // commission withdrawal
      if (currentAgent.commissionBalance < tx.amount) {
        return { success: false, error: "Processing Canceled: Insufficient commission balance." };
      }
    } else if (tx.type === "deposit") {
      // deposit request: check if wallet has enough to allocate
      if (currentAgent.walletBalance < tx.amount) {
        return { success: false, error: "Processing Canceled: Insufficient wallet balance to request Cash In." };
      }
    }

    // Generate valid receipt hash
    const receiptHash = "TXN" + Math.floor(100000000 + Math.random() * 900000000);
    
    // For deposit & withdrawal, status is 'pending' initially. For others, it is 'success'.
    const initialStatus = (tx.type === "deposit" || tx.type === "withdrawal") ? "pending" : "success";

    const newTx: Transaction = {
      id: "tx_" + Date.now(),
      agentId: currentAgent.agentId,
      agentName: currentAgent.name,
      customerMobile: tx.customerMobile,
      type: tx.type,
      operator: tx.operator,
      billType: tx.billType,
      amount: tx.amount,
      commissionEarned: (tx.type === "deposit" || tx.type === "withdrawal") ? commission : 0,
      status: initialStatus,
      timestamp: new Date().toISOString(),
      receiptNumber: receiptHash
    };

    // Update balances immediately only for instant success transactions
    if (initialStatus === "success") {
      setAgents(prev => prev.map(a => {
        if (a.agentId === currentAgent.agentId) {
          if (tx.type === "agent_withdraw") {
            return { ...a, commissionBalance: a.commissionBalance - tx.amount };
          } else {
            return { ...a, walletBalance: a.walletBalance - tx.amount };
          }
        }
        return a;
      }));
    }

    // Save transaction
    setTransactions(prev => [newTx, ...prev]);

    // Push notification logs
    const textDesc = tx.type === "deposit" ? "Cash In" : tx.type === "withdrawal" ? "Cash Out" : tx.type === "recharge" ? "Mobile Recharge" : tx.type === "agent_withdraw" ? "Commission Withdraw" : "Utility Bill";
    
    let notifTitle = `${textDesc} Submitted ⏳`;
    let notifBody = `Request of ${tx.amount.toLocaleString()} BDT is registered in pending queue. Approve it to fulfill BDT payout.`;
    if (initialStatus === "success") {
      notifTitle = `${textDesc} Processed Successfully 🚀`;
      notifBody = `Successfully processed BDT ${tx.amount.toLocaleString()} BDT. ${tx.type === "agent_withdraw" ? "Deducted from Commission Balance." : "Deducted from Wallet Balance."}`;
    }

    const newNotif: Notification = {
      id: "not_" + Date.now(),
      type: "individual",
      recipientAgentId: currentAgent.agentId,
      title: notifTitle,
      body: notifBody,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    return { success: true, receipt: newTx };
  };

  const handleApproveTransaction = (txId: string) => {
    let err: string | null = null;
    setTransactions(prev => {
      const idx = prev.findIndex(t => t.id === txId);
      if (idx === -1) return prev;
      const tx = prev[idx];
      if (tx.status !== "pending") return prev;

      // Double check balance for Cash In (Deposit)
      if (tx.type === "deposit") {
        const ag = agents.find(a => a.agentId === tx.agentId) || currentAgent;
        if (ag.walletBalance < tx.amount) {
          err = "Insufficient Agent wallet balance to process this Cash In!";
          return prev;
        }
      }

      // Update agent balances atomically
      setAgents(agentsList => agentsList.map(a => {
        if (a.agentId === tx.agentId) {
          // Cash In: deduct from wallet. Cash Out: add to wallet
          const walletAmt = tx.type === "deposit" ? -tx.amount : tx.amount;
          const commAmt = tx.commissionEarned;
          return {
            ...a,
            walletBalance: a.walletBalance + walletAmt,
            commissionBalance: (a.commissionBalance || 0) + commAmt
          };
        }
        return a;
      }));

      // Update transaction status in list
      const updated = [...prev];
      updated[idx] = { ...tx, status: "success" };

      // Dispatch notification
      const textDesc = tx.type === "deposit" ? "Cash In (Deposit)" : "Cash Out (Withdraw)";
      const newNotif: Notification = {
        id: "not_app_" + Date.now(),
        type: "individual",
        recipientAgentId: tx.agentId,
        title: `${textDesc} Completed! ✅`,
        body: `Your pending request of BDT ${tx.amount.toLocaleString()} is approved. +${tx.commissionEarned.toFixed(2)} BDT commission has been credited to your Commission Balance!`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(n => [newNotif, ...n]);

      return updated;
    });

    if (err) {
      return { success: false, error: err };
    }
    return { success: true };
  };

  const handleRejectTransaction = (txId: string) => {
    setTransactions(prev => {
      const idx = prev.findIndex(t => t.id === txId);
      if (idx === -1) return prev;
      const tx = prev[idx];
      if (tx.status !== "pending") return prev;

      const updated = [...prev];
      updated[idx] = { ...tx, status: "failed" };

      const textDesc = tx.type === "deposit" ? "Cash In" : "Cash Out";
      const newNotif: Notification = {
        id: "not_rej_" + Date.now(),
        type: "individual",
        recipientAgentId: tx.agentId,
        title: `${textDesc} Request Rejected ❌`,
        body: `Player request of BDT ${tx.amount.toLocaleString()} BDT has been cancelled/rejected. No money was moved.`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(n => [newNotif, ...n]);

      return updated;
    });
    return { success: true };
  };

  const allocatePlayerRequests = (agentId: string, agentName: string, bdtAmount: number) => {
    let depositAllocated = 0;
    let withdrawalAllocated = 0;

    let remainingAmount = bdtAmount;

    // 1. Process in blocks of 1200 BDT -> gives 2x 500 BDT Deposits & 1x 200 BDT Withdrawal
    const blocksOf1200 = Math.floor(remainingAmount / 1200);
    for (let i = 0; i < blocksOf1200; i++) {
      if (globalPoolDeposits >= depositAllocated + 2 && globalPoolWithdrawals >= withdrawalAllocated + 1) {
        depositAllocated += 2;
        withdrawalAllocated += 1;
        remainingAmount -= 1200;
      } else {
        break;
      }
    }

    // 2. Process remainders >= 500 BDT with Deposits
    const count500 = Math.floor(remainingAmount / 500);
    for (let i = 0; i < count500; i++) {
      if (globalPoolDeposits >= depositAllocated + 1) {
        depositAllocated += 1;
        remainingAmount -= 500;
      } else {
        break;
      }
    }

    // 3. Process remainders >= 200 BDT with Withdrawals
    const count200 = Math.floor(remainingAmount / 200);
    for (let i = 0; i < count200; i++) {
      if (globalPoolWithdrawals >= withdrawalAllocated + 1) {
        withdrawalAllocated += 1;
        remainingAmount -= 200;
      } else {
        break;
      }
    }

    // 4. Update the global pool counts
    setGlobalPoolDeposits(prev => Math.max(0, prev - depositAllocated));
    setGlobalPoolWithdrawals(prev => Math.max(0, prev - withdrawalAllocated));

    // 5. Generate actual Player Transaction entities (pending)
    const newTxs: Transaction[] = [];
    const rxMobiles = [
      "01715887234", "01824991823", "01931827364", "01523829102", "01625345678",
      "01723491820", "01834918293", "01948291039", "01519403920", "01619384920",
      "01799291048", "01822839204", "01911928394", "01300928394", "01400928492"
    ];
    const getRandomMobile = () => rxMobiles[Math.floor(Math.random() * rxMobiles.length)];

    for (let i = 0; i < depositAllocated; i++) {
      const receiptHash = "TXN" + Math.floor(100000000 + Math.random() * 900000000);
      newTxs.push({
        id: `tx_pl_dep_${Date.now()}_hf_${i}_${Math.random().toString(36).substr(2, 5)}`,
        agentId: agentId,
        agentName: agentName,
        customerMobile: getRandomMobile(),
        type: "deposit",
        amount: 500,
        commissionEarned: 25.0, // 5% flat commission of 500
        status: "pending",
        timestamp: new Date().toISOString(),
        receiptNumber: receiptHash
      });
    }

    for (let i = 0; i < withdrawalAllocated; i++) {
      const receiptHash = "TXN" + Math.floor(100000000 + Math.random() * 900000000);
      newTxs.push({
        id: `tx_pl_with_${Date.now()}_hf_${i}_${Math.random().toString(36).substr(2, 5)}`,
        agentId: agentId,
        agentName: agentName,
        customerMobile: getRandomMobile(),
        type: "withdrawal",
        amount: 200,
        commissionEarned: 6.0, // 3% flat commission of 200
        status: "pending",
        timestamp: new Date().toISOString(),
        receiptNumber: receiptHash
      });
    }

    if (newTxs.length > 0) {
      setTransactions(prev => [...newTxs, ...prev]);

      // Deploy individual notification
      const bonusNotif: Notification = {
        id: "not_pl_bonus_" + Date.now(),
        type: "individual",
        recipientAgentId: agentId,
        title: "Player Requests Allocated! 📥",
        body: `Approved loads. You received ${depositAllocated} Cash In requests (৳500 BDT) and ${withdrawalAllocated} Cash Out requests (৳200 BDT). Settle them to earn automatic commission on real balance!`,
        timestamp: new Date().toISOString(),
        read: false
      };
      setNotifications(prev => [bonusNotif, ...prev]);
    }
  };

  const handleSimulatePlayerRequest = (type: "deposit" | "withdrawal") => {
    if (type === "deposit" && globalPoolDeposits <= 0) {
      alert("Error: Deposit Request Pool is currently empty! Super Admin can refill it inside Admin Panel.");
      return;
    }
    if (type === "withdrawal" && globalPoolWithdrawals <= 0) {
      alert("Error: Withdrawal Request Pool is currently empty! Super Admin can refill it inside Admin Panel.");
      return;
    }

    const amt = type === "deposit" ? 500 : 200;
    const rate = type === "deposit" ? 0.05 : 0.03;
    const commission = amt * rate;

    // Decrement pool
    if (type === "deposit") {
      setGlobalPoolDeposits(prev => Math.max(0, prev - 1));
    } else {
      setGlobalPoolWithdrawals(prev => Math.max(0, prev - 1));
    }

    const rxMobiles = ["01911223344", "01855667788", "01799887766", "01511223344", "01688776655", "01712391024", "01831820394"];
    const randomMobile = rxMobiles[Math.floor(Math.random() * rxMobiles.length)];
    const receiptHash = "TXN" + Math.floor(100000000 + Math.random() * 900000000);

    const pendingTx: Transaction = {
      id: "tx_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
      agentId: currentAgent.agentId,
      agentName: currentAgent.name,
      customerMobile: randomMobile,
      type: type,
      amount: amt,
      commissionEarned: commission,
      status: "pending",
      timestamp: new Date().toISOString(),
      receiptNumber: receiptHash
    };

    setTransactions(prev => [pendingTx, ...prev]);

    // Send notifications
    const newNotif: Notification = {
      id: "not_sim_" + Date.now(),
      type: "individual",
      recipientAgentId: currentAgent.agentId,
      title: `Player ${type === "deposit" ? "Deposit" : "Withdrawal"} Request Got 📥`,
      body: `You received a pending request of ${amt} BDT from player ${randomMobile} (pulled from Global Pool). Review and approve it now.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Agent Cash Request
  const handleRequestAgentCash = (method: "bKash" | "Nagad", amount: number, senderNumber: string, transactionId: string, screenshotUrl?: string) => {
    const bdtAmount = amount;
    const usdAmount = amount / 120; // 1 USD = 120 BDT
    
    const newReq: AgentCashRequest = {
      id: "req_" + Date.now(),
      agentId: currentAgent.agentId,
      agentName: currentAgent.name,
      method: method,
      amount: bdtAmount,
      usdAmount: parseFloat(usdAmount.toFixed(2)),
      senderNumber: senderNumber,
      transactionId: transactionId,
      screenshotUrl: screenshotUrl || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=120&auto=format&fit=crop&q=60&referrerPolicy=no-referrer",
      status: "pending",
      timestamp: new Date().toISOString()
    };

    setAgentCashRequests(prev => [newReq, ...prev]);

    // Notify Super Admin
    const adminNotif: Notification = {
      id: "not_admin_" + Date.now(),
      type: "broadcast",
      recipientAgentId: null, // broadcast to admins
      title: `New Cash request from ${currentAgent.name} 💰`,
      body: `Requested BDT ${bdtAmount} BDT via ${method}. Transaction ID: ${transactionId}. Review inside Super Admin Dashboard.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [adminNotif, ...prev]);

    return { success: true };
  };

  // Super Admin action to approve/reject Agent Cash Requests
  const handleProcessAgentCashRequest = (requestId: string, status: "approved" | "rejected") => {
    setAgentCashRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        if (req.status !== "pending") return req;

        if (status === "approved") {
          // Increase agent's balance
          setAgents(agentsList => agentsList.map(a => {
            if (a.agentId === req.agentId) {
              return { ...a, walletBalance: a.walletBalance + req.amount };
            }
            return a;
          }));

          // Automatically allocate player requests matching their deposit load!
          allocatePlayerRequests(req.agentId, req.agentName, req.amount);

          // Notify Agent
          const agentNotif: Notification = {
            id: "not_cash_app_" + Date.now(),
            type: "individual",
            recipientAgentId: req.agentId,
            title: `Agent Cash Request Approved! 💰`,
            body: `Your cash check of BDT ${req.amount.toLocaleString()} has been processed by Super Admin. Balance loaded successfully!`,
            timestamp: new Date().toISOString(),
            read: false
          };
          setNotifications(n => [agentNotif, ...n]);
        } else {
          // Notify Agent rejection
          const agentNotif: Notification = {
            id: "not_cash_rej_" + Date.now(),
            type: "individual",
            recipientAgentId: req.agentId,
            title: `Agent Cash Request Rejected ❌`,
            body: `Your transaction of ${req.amount} BDT was rejected after checking. Please check your Transaction ID and submit again.`,
            timestamp: new Date().toISOString(),
            read: false
          };
          setNotifications(n => [agentNotif, ...n]);
        }

        return { ...req, status };
      }
      return req;
    }));
  };

  const handleRefillGlobalPool = () => {
    setGlobalPoolDeposits(200);
    setGlobalPoolWithdrawals(200);
    
    const notif: Notification = {
      id: "not_refill_" + Date.now(),
      type: "broadcast",
      recipientAgentId: null,
      title: "Global Request Pool Refilled 🔄",
      body: "Super Admin has refilled the target player transaction pool to 200 Cash-In (Deposit) and 200 Cash-Out (Withdrawal) requests.",
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // 5. REGISTRATION AND INVITES HANDLERS
  const handleAddCustomer = (name: string, mobile: string) => {
    const exists = customers.some(c => c.mobile === mobile);
    if (exists) {
      return { success: false, error: "Database Conflict: Mobile number already listed in customer directory." };
    }

    const newCustomer: Customer = {
      id: "cust_" + Date.now(),
      name,
      mobile,
      registeredByAgentId: currentAgent.agentId,
      createdAt: new Date().toISOString()
    };

    setCustomers(prev => [newCustomer, ...prev]);

    if (isLiveFirebaseConfigured) {
      (async () => {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          const { db } = await import("./firebase");
          if (db) {
            await setDoc(doc(db, "customers", newCustomer.id), newCustomer);
          }
        } catch (e) {
          console.error("Live customer failed to write to Firestore:", e);
        }
      })();
    }

    return { success: true };
  };

  const handleAddReferral = (referredName: string, referredMobile: string) => {
    // Register referred agent in pending state
    const newAgentId = "agent_gen_" + Date.now();
    const cleanCode = "BDG" + referredMobile.substring(referredMobile.length - 6);
    
    const newAgent: Agent = {
      agentId: newAgentId,
      name: referredName,
      mobile: referredMobile,
      status: "pending", // Pending admin approval
      walletBalance: 0.0,
      commissionBalance: 0.0,
      referredBy: currentAgent.referralCode,
      referralCode: cleanCode,
      createdAt: new Date().toISOString()
    };

    const newRef: Referral = {
      id: "ref_" + Date.now(),
      referrerAgentId: currentAgent.agentId,
      referrerAgentName: currentAgent.name,
      referredAgentId: newAgentId,
      referredAgentName: referredName,
      rewardAmount: 500, // rewarded flat on approval
      status: "pending_approval",
      timestamp: new Date().toISOString()
    };

    setAgents(prev => [...prev, newAgent]);
    setReferrals(prev => [newRef, ...prev]);

    if (isLiveFirebaseConfigured) {
      (async () => {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          const { db } = await import("./firebase");
          if (db) {
            await setDoc(doc(db, "agents", newAgent.agentId), newAgent);
            await setDoc(doc(db, "referrals", newRef.id), newRef);
          }
        } catch (e) {
          console.error("Live referral failed to write to Firestore:", e);
        }
      })();
    }
  };

  // 6. ADMINISTRATIVE HANDLERS
  const handleUpdateAgentStatus = (agentId: string, status: AgentStatus) => {
    setAgents(prev => prev.map(a => {
      if (a.agentId === agentId) {
        return { ...a, status };
      }
      return a;
    }));

    // If approved and the referral code matches, auto-reward the referrer
    if (status === "approved") {
      setReferrals(prev => prev.map(r => {
        if (r.referredAgentId === agentId && r.status === "pending_approval") {
          // Add reward bonus to referrer
          setAgents(inner => inner.map(itm => {
            if (itm.agentId === r.referrerAgentId) {
              return { ...itm, walletBalance: itm.walletBalance + r.rewardAmount };
            }
            return itm;
          }));

          // Notify referrer
          const newNotif: Notification = {
            id: "not_reward_" + Date.now(),
            type: "individual",
            recipientAgentId: r.referrerAgentId,
            title: "Referral Sign-up Reward Credited 🎁",
            body: `Your referred agent '${r.referredAgentName}' has been approved by the Admin team. BDT 500.00 signup bonus has been securely disbursed to your wallet!`,
            timestamp: new Date().toISOString(),
            read: false
          };
          setNotifications(n => [newNotif, ...n]);

          if (isLiveFirebaseConfigured) {
            (async () => {
              try {
                const { doc, setDoc } = await import("firebase/firestore");
                const { db } = await import("./firebase");
                if (db) {
                  const refAgent = agents.find(itm => itm.agentId === r.referrerAgentId);
                  if (refAgent) {
                    await setDoc(doc(db, "agents", r.referrerAgentId), {
                      ...refAgent,
                      walletBalance: refAgent.walletBalance + r.rewardAmount
                    }, { merge: true });
                  }
                  await setDoc(doc(db, "referrals", r.id), { status: "rewarded" }, { merge: true });
                  await setDoc(doc(db, "notifications", newNotif.id), newNotif);
                }
              } catch (e) {
                console.error("Live referral reward update failed:", e);
              }
            })();
          }

          return { ...r, status: "rewarded" as const };
        }
        return r;
      }));
    }

    if (isLiveFirebaseConfigured) {
      (async () => {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          const { db } = await import("./firebase");
          if (db) {
            await setDoc(doc(db, "agents", agentId), { status }, { merge: true });
          }
        } catch (e) {
          console.error("Live agent status update failed:", e);
        }
      })();
    }
  };

  const handleDeleteAgent = (agentId: string) => {
    setAgents(prev => prev.filter(a => a.agentId !== agentId));
    setReferrals(prev => prev.filter(r => r.referredAgentId !== agentId && r.referrerAgentId !== agentId));

    if (isLiveFirebaseConfigured) {
      (async () => {
        try {
          const { doc, deleteDoc } = await import("firebase/firestore");
          const { db } = await import("./firebase");
          if (db) {
            await deleteDoc(doc(db, "agents", agentId));
          }
        } catch (e) {
          console.error("Live agent deletion failed:", e);
        }
      })();
    }
  };

  const handleAddNotificationFromAdmin = (not: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNot: Notification = {
      ...not,
      id: "not_admin_" + Date.now(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNot, ...prev]);

    if (isLiveFirebaseConfigured) {
      (async () => {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          const { db } = await import("./firebase");
          if (db) {
            await setDoc(doc(db, "notifications", newNot.id), newNot);
          }
        } catch (e) {
          console.error("Live alert write failed:", e);
        }
      })();
    }
  };

  const handleLogout = async () => {
    if (isLiveFirebaseConfigured) {
      try {
        const { auth } = await import("./firebase");
        if (auth) {
          const { signOut } = await import("firebase/auth");
          await signOut(auth);
        }
      } catch (err) {
        console.error("Error signing out:", err);
      }
    }
    setLoggedInAgent(null);
    localStorage.removeItem("ewallet_loggedInAgent");
    setRole("agent");
    setNavTab("dashboard");
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem("ewallet_isAdminAuthenticated");
    setRole("agent");
    setNavTab("dashboard");
  };

  const handleResetDatabase = () => {
    localStorage.removeItem("ewallet_agents");
    localStorage.removeItem("ewallet_customers");
    localStorage.removeItem("ewallet_transactions");
    localStorage.removeItem("ewallet_referrals");
    localStorage.removeItem("ewallet_notifications");
    window.location.reload();
  };


  // Navigations trigger
  const handleLaunchOperation = (type: TransactionType) => {
    setLaunchPreset(type);
    setNavTab("transactions");
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AndroidFrame
      activeRole={role}
      onRoleToggle={() => {
        const nextRole = role === "agent" ? "admin" : "agent";
        setRole(nextRole);
        // Reset navigation
        setNavTab(nextRole === "admin" ? "admin" : "dashboard");
      }}
      lang={lang}
      onLangToggle={() => setLang(prev => prev === "English" ? "Bangla" : "English")}
      isDark={isDark}
      onThemeToggle={() => setIsDark(!isDark)}
      onOpenDevHub={() => setDevHubOpen(true)}
      notificationCount={unreadNotificationCount}
      agentStatus={currentAgent.status}
    >
      
      {/* Main Tab Routes Routing Container viewport */}
      <div className="flex-1 w-full h-full overflow-hidden relative flex flex-col">
        {role === "agent" ? (
          !loggedInAgent ? (
            <AuthScreen
              lang={lang}
              onLangToggle={() => setLang(prev => prev === "English" ? "Bangla" : "English")}
              isDark={isDark}
              onThemeToggle={() => setIsDark(!isDark)}
              onAuthSuccess={(agentData) => {
                setLoggedInAgent(agentData as Agent);
                localStorage.setItem("ewallet_loggedInAgent", JSON.stringify(agentData));
                
                // Let's also ensure this agent exists in our synchronized list
                setAgents(prev => {
                  const exists = prev.some(a => a.agentId === agentData.agentId);
                  if (exists) {
                    return prev.map(a => a.agentId === agentData.agentId ? { ...a, ...agentData } : a);
                  }
                  return [...prev, agentData as Agent];
                });
                
                setNavTab("dashboard");
              }}
            />
          ) : (
            <>
              {navTab === "dashboard" && (
                <DashboardTab
                  agent={currentAgent}
                  transactions={transactions}
                  lang={lang}
                  onLaunchOperation={handleLaunchOperation}
                  onNavigateToTab={(tab: MainTab) => setNavTab(tab)}
                  isDark={isDark}
                  onOpenNotifications={() => {
                    setShowNotificationPopup(true);
                    markAllNotificationsRead();
                  }}
                  unreadNotificationCount={unreadNotificationCount}
                />
              )}

              {navTab === "transactions" && (
                <TransactionsTab
                  agent={currentAgent}
                  transactions={transactions}
                  agentCashRequests={agentCashRequests}
                  lang={lang}
                  onExecuteTransaction={handleExecuteTransaction}
                  onApproveTransaction={handleApproveTransaction}
                  onRejectTransaction={handleRejectTransaction}
                  onSimulatePlayerRequest={handleSimulatePlayerRequest}
                  onExecuteRequestAgentCash={handleRequestAgentCash}
                  isDark={isDark}
                  preSelectedOp={launchPreset}
                  onClearPreselection={() => setLaunchPreset(undefined)}
                  globalPoolDeposits={globalPoolDeposits}
                  globalPoolWithdrawals={globalPoolWithdrawals}
                />
              )}

              {navTab === "earnings" && (
                <EarningsTab
                  agent={currentAgent}
                  transactions={transactions}
                  referrals={referrals}
                  lang={lang}
                  onAddReferral={handleAddReferral}
                  isDark={isDark}
                />
              )}

              {navTab === "customers" && (
                <CustomersTab
                  customers={customers}
                  transactions={transactions}
                  lang={lang}
                  onAddCustomer={handleAddCustomer}
                  isDark={isDark}
                />
              )}

              {navTab === "profile" && (
                <ProfileTab
                  agent={currentAgent}
                  lang={lang}
                  onLangToggle={() => setLang(prev => prev === "English" ? "Bangla" : "English")}
                  isDark={isDark}
                  onThemeToggle={() => setIsDark(!isDark)}
                  onLogout={handleLogout}
                  onResetDatabase={handleResetDatabase}
                />
              )}
            </>
          )
        ) : (
          !isAdminAuthenticated ? (
            <AdminLogin
              lang={lang}
              onLangToggle={() => setLang(prev => prev === "English" ? "Bangla" : "English")}
              isDark={isDark}
              onThemeToggle={() => setIsDark(!isDark)}
              onSuccess={() => {
                setIsAdminAuthenticated(true);
                localStorage.setItem("ewallet_isAdminAuthenticated", "true");
              }}
              onCancel={() => {
                setRole("agent");
                setNavTab("dashboard");
              }}
            />
          ) : (
            <AdminPanel
              agents={agents}
              customers={customers}
              transactions={transactions}
              notifications={notifications}
              agentCashRequests={agentCashRequests}
              onProcessAgentCashRequest={handleProcessAgentCashRequest}
              globalPoolDeposits={globalPoolDeposits}
              globalPoolWithdrawals={globalPoolWithdrawals}
              onRefillGlobalPool={handleRefillGlobalPool}
              onUpdateAgentStatus={handleUpdateAgentStatus}
              onDeleteAgent={handleDeleteAgent}
              onAddNotification={handleAddNotificationFromAdmin}
              onAdminLogout={handleAdminLogout}
              isDark={isDark}
              onOpenNotifications={() => {
                setShowNotificationPopup(true);
                markAllNotificationsRead();
              }}
              unreadNotificationCount={unreadNotificationCount}
            />
          )
        )}
      </div>


      {/* Bottom Navigation Bars menu (Matches material design specs) */}
      {role === "agent" && loggedInAgent && (
        <div className={`absolute bottom-0 left-0 right-0 py-1.5 px-3 border-t flex justify-around items-center z-40 transition-colors ${
          isDark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100 shadow-lg"
        }`}>
          {(["dashboard", "transactions", "earnings", "customers", "profile"] as MainTab[]).map((tab) => (
            <button
              key={tab}
              id={`nav-tab-toggle-${tab}`}
              onClick={() => setNavTab(tab)}
              className={`flex-col items-center py-1 transition-all flex select-none cursor-pointer outline-none ${
                navTab === tab 
                  ? "text-emerald-500 scale-105 duration-200" 
                  : "text-slate-500 hover:text-slate-400"
              }`}
            >
              <span className="text-xs mb-0.5 leading-none">
                {tab === "dashboard" ? "📁" : tab === "transactions" ? "💳" : tab === "earnings" ? "💰" : tab === "customers" ? "👥" : "⚙️"}
              </span>
              <span className="text-[9px] font-bold tracking-tight uppercase leading-none">
                {t[tab as keyof typeof t] || tab}
              </span>
            </button>
          ))}
        </div>
      )}


      {/* Notification Drawer Modal */}
      {showNotificationPopup && (
        <div className="absolute inset-x-0 top-0 bottom-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end p-0">
          <div className={`w-full max-w-sm h-full flex flex-col shadow-2xl relative animate-slide-left ${
            isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"
          }`}>
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-emerald-500" />
                <h4 className="font-extrabold text-sm uppercase tracking-wide">{t.notificationTitle}</h4>
              </div>
              
              <button
                id="close-notifications-btn"
                onClick={() => setShowNotificationPopup(false)}
                className="p-1 px-3.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-400 text-xs font-bold leading-tight cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 scrollbar-none">
              {notifications
                .filter(n => n.recipientAgentId === null || n.recipientAgentId === currentAgent.agentId)
                .map((not) => (
                  <div 
                    key={not.id} 
                    className={`p-3.5 rounded-2xl border flex flex-col text-xs leading-relaxed transition-all ${
                      not.type === "broadcast" 
                        ? "bg-blue-500/5 border-blue-500/10" 
                        : "bg-slate-950/20 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[8px] font-extrabold px-2 py-0.2 rounded-full ${
                        not.type === "broadcast" ? "bg-blue-600 text-white" : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {not.type.toUpperCase()}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500">
                        {new Date(not.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                      </span>
                    </div>

                    <h5 className="font-extrabold text-xs mb-0.5">{not.title}</h5>
                    <p className="text-[11px] text-slate-400">{not.body}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Developer Hub Code Exporter Modal */}
      {devHubOpen && (
        <DevHub
          onClose={() => setDevHubOpen(false)}
          isDark={isDark}
        />
      )}

    </AndroidFrame>
  );
}
