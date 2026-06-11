import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import defaultFirebaseConfig from './firebase-applet-config.json';

// Define action Types for logging
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

// Check dynamic localStorage override first
const getLiveConfig = () => {
  try {
    const saved = localStorage.getItem("ewallet_firebase_config");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && !parsed.apiKey.includes("Placeholder")) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load saved firebase config", e);
  }
  return defaultFirebaseConfig;
};

export const currentConfig = getLiveConfig();

// Is it running on live custom credentials?
export const isLiveFirebaseConfigured = !currentConfig.apiKey.includes("Placeholder");

let app: FirebaseApp | null = null;
let database: Firestore | null = null;
let firebaseAuth: Auth | null = null;

if (isLiveFirebaseConfigured) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(currentConfig);
    } else {
      app = getApp();
    }
    database = getFirestore(app, currentConfig.firestoreDatabaseId || "(default)");
    firebaseAuth = getAuth(app);
    console.log("🔥 [Firebase] Live environment initialized successfully.");
  } catch (error) {
    console.error("🔥 [Firebase] Live connection error during bootstrap:", error);
  }
} else {
  console.log("⚡ [Firebase] Development Sandbox mode is running using mock-database state.");
}

export const db = database;
export const auth = firebaseAuth;

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || "sandbox-id-agent",
      email: auth?.currentUser?.email || "sandbox-agent@ewallet.com",
      emailVerified: auth?.currentUser?.emailVerified || true,
      isAnonymous: auth?.currentUser?.isAnonymous || false,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('[Firebase Error Log]: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
