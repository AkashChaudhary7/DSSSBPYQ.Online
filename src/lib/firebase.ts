import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, increment, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Quiz } from '../types';

let app: any = null;
let db: any = null;
let isConfigured = false;

// Safe initialization (Disabled to use always-free, fast local-only device database storage)
isConfigured = false;
db = null;

export { db, isConfigured };

// Type for the real-time subscription
export interface AnalyticsData {
  totalVisitors: number;
  dailyVisitors: number;
  totalPageViews: number;
  totalTestsAttempted: number;
  pdfDownloads: number;
  activeNow: number;
}
export type AnalyticsCallback = (data: AnalyticsData) => void;

// Track active listeners
const listeners = new Set<AnalyticsCallback>();
let unsubscribeSnapshot: (() => void) | null = null;
let cachedData: AnalyticsData = {
  totalVisitors: 0,
  dailyVisitors: 0,
  totalPageViews: 0,
  totalTestsAttempted: 0,
  pdfDownloads: 0,
  activeNow: 1
};

// Helper to get today's date string in YYYY-MM-DD
const getTodayDateString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export async function incrementGlobalStat(metric: 'tests_attempted' | 'pdf_downloads' | 'page_views'): Promise<void> {
  if (!isConfigured || !db) return;
  try {
    const globalDocRef = doc(db, 'analytics', 'global');
    await setDoc(globalDocRef, {
      [`total_${metric}`]: increment(1),
      last_updated: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn(`Could not increment stat ${metric}:`, err);
  }
}

export async function trackVisitAndSubscribe(callback: AnalyticsCallback): Promise<() => void> {
  listeners.add(callback);

  const todayStr = getTodayDateString();

  // Helper to trigger callback for all active listeners
  const notifyAll = (fullData: AnalyticsData) => {
    cachedData = fullData;
    listeners.forEach(cb => cb(cachedData));
  };

  // Provide initial cached state immediately
  callback(cachedData);

  if (!isConfigured || !db) {
    return () => {
      listeners.delete(callback);
    };
  }

  try {
    const globalDocRef = doc(db, 'analytics', 'global');

    // Fetch the document first to check if a global reset to 0 is needed
    const docSnap = await getDoc(globalDocRef).catch(() => null);
    if (!docSnap || !docSnap.exists() || !docSnap.data()?.reset_v2026) {
      try {
        await setDoc(globalDocRef, {
          total_visitors: 0,
          total_page_views: 0,
          total_tests_attempted: 0,
          total_pdf_downloads: 0,
          reset_v2026: true,
          last_updated: new Date().toISOString()
        }, { merge: false });
      } catch (err) {
        console.warn("Could not reset Firestore analytics:", err);
      }
    }

    // Precise unique-device tracking to prevent duplicate/mismatched counts
    const visitorIdKey = 'dsssb_visitor_id_v2026';
    const lastVisitKey = 'dsssb_last_visit_date_v2026';

    const isNewVisitor = !localStorage.getItem(visitorIdKey);
    const lastVisitDate = localStorage.getItem(lastVisitKey);
    const isNewDay = lastVisitDate !== todayStr;

    const updates: any = {
      total_page_views: increment(1)
    };
    let shouldUpdate = true;

    if (isNewVisitor) {
      const uniqueId = 'vis_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem(visitorIdKey, uniqueId);
      updates.total_visitors = increment(1);
    }

    if (isNewDay) {
      localStorage.setItem(lastVisitKey, todayStr);
      updates[`visits_${todayStr}`] = increment(1);
    }

    if (shouldUpdate) {
      updates.last_updated = new Date().toISOString();
      try {
        await setDoc(globalDocRef, updates, { merge: true });
      } catch (e) {
        console.warn("Could not increment Firestore analytics:", e);
      }
    }

    // Set up a single shared real-time snapshot listener
    if (!unsubscribeSnapshot) {
      unsubscribeSnapshot = onSnapshot(globalDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data) {
            const rawTotal = typeof data.total_visitors === 'number' ? data.total_visitors : 0;
            const rawDaily = typeof data[`visits_${todayStr}`] === 'number' ? data[`visits_${todayStr}`] : 0;
            const rawViews = typeof data.total_page_views === 'number' ? data.total_page_views : rawTotal * 3 + 12;
            const rawTests = typeof data.total_tests_attempted === 'number' ? data.total_tests_attempted : 0;
            const rawPdfs = typeof data.total_pdf_downloads === 'number' ? data.total_pdf_downloads : 0;

            // Generate active users indicator (1-12 active aspirants online)
            const activeNow = Math.max(1, Math.floor((rawDaily % 9) + 3));

            notifyAll({
              totalVisitors: Math.max(0, rawTotal),
              dailyVisitors: Math.max(0, rawDaily),
              totalPageViews: Math.max(0, rawViews),
              totalTestsAttempted: Math.max(0, rawTests),
              pdfDownloads: Math.max(0, rawPdfs),
              activeNow
            });
          }
        }
      }, (error) => {
        console.warn("Firestore analytics snapshot error:", error);
      });
    } else {
      callback(cachedData);
    }
  } catch (err) {
    console.warn("Error in trackVisitAndSubscribe:", err);
  }

  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }
  };
}

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
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Save custom quiz to Firestore
export async function saveCustomQuizToDb(quiz: Quiz): Promise<void> {
  if (!isConfigured || !db) return;
  const path = `custom_quizzes/${quiz.testId}`;
  try {
    const docRef = doc(db, 'custom_quizzes', quiz.testId);
    // Convert undefined to null for safe firestore serialization
    const cleanQuiz = JSON.parse(JSON.stringify(quiz, (k, v) => v === undefined ? null : v));
    await setDoc(docRef, cleanQuiz);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Fetch all custom quizzes from Firestore
export async function fetchCustomQuizzesFromDb(): Promise<Quiz[]> {
  if (!isConfigured || !db) return [];
  const path = 'custom_quizzes';
  try {
    const colRef = collection(db, 'custom_quizzes');
    const snapshot = await getDocs(colRef);
    const quizzes: Quiz[] = [];
    snapshot.forEach(docSnap => {
      if (docSnap.exists()) {
        quizzes.push(docSnap.data() as Quiz);
      }
    });
    return quizzes;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

// Delete custom quiz from Firestore
export async function deleteCustomQuizFromDb(testId: string): Promise<void> {
  if (!isConfigured || !db) return;
  const path = `custom_quizzes/${testId}`;
  try {
    const docRef = doc(db, 'custom_quizzes', testId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

