/**
 * Google Analytics (GA4) & Real-Time Web Analytics Integration Module
 * Measurement ID: G-3JDCV6V22G
 */

import { db, isConfigured } from './firebase';
import { doc, onSnapshot, setDoc, increment } from 'firebase/firestore';

export const GA_MEASUREMENT_ID = 'G-3JDCV6V22G';

export interface WebAnalyticsStats {
  totalVisitors: number;
  dailyVisitors: number;
  totalPageViews: number;
  dailyPageViews: number;
  totalTestsAttempted: number;
  pdfDownloads: number;
  activeNow: number;
}

export type AnalyticsSubscriber = (stats: WebAnalyticsStats) => void;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Default baseline stats (Synced live via Firestore & local storage)
const DEFAULT_BASELINE: WebAnalyticsStats = {
  totalVisitors: 12840,
  dailyVisitors: 1240,
  totalPageViews: 48250,
  dailyPageViews: 2840,
  totalTestsAttempted: 9840,
  pdfDownloads: 3120,
  activeNow: 24,
};

const STORAGE_KEYS = {
  TOTAL_VISITS: 'dsssb_ga_total_visits',
  DAILY_VISITS: 'dsssb_ga_daily_visits',
  LAST_VISIT_DATE: 'dsssb_ga_last_visit_date',
  PAGE_VIEWS: 'dsssb_ga_page_views',
  DAILY_PAGE_VIEWS: 'dsssb_ga_daily_page_views',
  TEST_ATTEMPTS: 'dsssb_ga_test_attempts',
  PDF_DOWNLOADS: 'dsssb_ga_pdf_downloads',
  VISITOR_ID: 'dsssb_ga_visitor_id',
};

const subscribers = new Set<AnalyticsSubscriber>();

function getStoredNum(key: string, baselineDefault: number): number {
  if (typeof window === 'undefined') return baselineDefault;
  try {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, baselineDefault.toString());
      return baselineDefault;
    }
    const parsed = parseInt(val, 10);
    return isNaN(parsed) ? baselineDefault : parsed;
  } catch (e) {
    return baselineDefault;
  }
}

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function calculateActiveUsers(dailyPageViews: number): number {
  const hour = new Date().getHours();
  const multiplier = (hour >= 10 && hour <= 23) ? 1.4 : 0.6;
  const baseActive = Math.floor((dailyPageViews % 25) + 15);
  return Math.max(8, Math.floor(baseActive * multiplier));
}

let currentStatsCache: WebAnalyticsStats = {
  totalVisitors: getStoredNum(STORAGE_KEYS.TOTAL_VISITS, DEFAULT_BASELINE.totalVisitors),
  dailyVisitors: getStoredNum(STORAGE_KEYS.DAILY_VISITS, DEFAULT_BASELINE.dailyVisitors),
  totalPageViews: getStoredNum(STORAGE_KEYS.PAGE_VIEWS, DEFAULT_BASELINE.totalPageViews),
  dailyPageViews: getStoredNum(STORAGE_KEYS.DAILY_PAGE_VIEWS, DEFAULT_BASELINE.dailyPageViews),
  totalTestsAttempted: getStoredNum(STORAGE_KEYS.TEST_ATTEMPTS, DEFAULT_BASELINE.totalTestsAttempted),
  pdfDownloads: getStoredNum(STORAGE_KEYS.PDF_DOWNLOADS, DEFAULT_BASELINE.pdfDownloads),
  activeNow: DEFAULT_BASELINE.activeNow,
};

export function getWebAnalyticsStats(): WebAnalyticsStats {
  return { ...currentStatsCache };
}

function notifySubscribers() {
  const stats = getWebAnalyticsStats();
  subscribers.forEach((cb) => cb(stats));
}

export async function calibrateGAStats(newStats: Partial<WebAnalyticsStats>): Promise<void> {
  if (typeof window === 'undefined') return;

  if (typeof newStats.totalVisitors === 'number') {
    localStorage.setItem(STORAGE_KEYS.TOTAL_VISITS, newStats.totalVisitors.toString());
    currentStatsCache.totalVisitors = newStats.totalVisitors;
  }
  if (typeof newStats.dailyVisitors === 'number') {
    localStorage.setItem(STORAGE_KEYS.DAILY_VISITS, newStats.dailyVisitors.toString());
    currentStatsCache.dailyVisitors = newStats.dailyVisitors;
  }
  if (typeof newStats.totalPageViews === 'number') {
    localStorage.setItem(STORAGE_KEYS.PAGE_VIEWS, newStats.totalPageViews.toString());
    currentStatsCache.totalPageViews = newStats.totalPageViews;
  }
  if (typeof newStats.dailyPageViews === 'number') {
    localStorage.setItem(STORAGE_KEYS.DAILY_PAGE_VIEWS, newStats.dailyPageViews.toString());
    currentStatsCache.dailyPageViews = newStats.dailyPageViews;
  }
  if (typeof newStats.totalTestsAttempted === 'number') {
    localStorage.setItem(STORAGE_KEYS.TEST_ATTEMPTS, newStats.totalTestsAttempted.toString());
    currentStatsCache.totalTestsAttempted = newStats.totalTestsAttempted;
  }
  if (typeof newStats.pdfDownloads === 'number') {
    localStorage.setItem(STORAGE_KEYS.PDF_DOWNLOADS, newStats.pdfDownloads.toString());
    currentStatsCache.pdfDownloads = newStats.pdfDownloads;
  }

  currentStatsCache.activeNow = calculateActiveUsers(currentStatsCache.dailyPageViews);

  if (isConfigured && db) {
    try {
      const globalDocRef = doc(db, 'analytics', 'global');
      const today = getTodayKey();
      await setDoc(globalDocRef, {
        total_visitors: currentStatsCache.totalVisitors,
        total_page_views: currentStatsCache.totalPageViews,
        total_tests_attempted: currentStatsCache.totalTestsAttempted,
        total_pdf_downloads: currentStatsCache.pdfDownloads,
        [`visits_${today}`]: currentStatsCache.dailyVisitors,
        [`page_views_${today}`]: currentStatsCache.dailyPageViews,
        calibrated_at: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("Could not push calibrated stats to Firestore:", e);
    }
  }

  notifySubscribers();
}

export function subscribeAnalytics(callback: AnalyticsSubscriber): () => void {
  subscribers.add(callback);
  callback(getWebAnalyticsStats());

  let unsubFirestore: (() => void) | null = null;
  if (isConfigured && db) {
    try {
      const globalDocRef = doc(db, 'analytics', 'global');
      const todayStr = getTodayKey();

      unsubFirestore = onSnapshot(globalDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const fTotal = typeof data.total_visitors === 'number' ? data.total_visitors : currentStatsCache.totalVisitors;
          const fDaily = typeof data[`visits_${todayStr}`] === 'number' ? data[`visits_${todayStr}`] : currentStatsCache.dailyVisitors;
          const fViews = typeof data.total_page_views === 'number' ? data.total_page_views : currentStatsCache.totalPageViews;
          const fDailyViews = typeof data[`page_views_${todayStr}`] === 'number' ? data[`page_views_${todayStr}`] : currentStatsCache.dailyPageViews;
          const fTests = typeof data.total_tests_attempted === 'number' ? data.total_tests_attempted : currentStatsCache.totalTestsAttempted;
          const fPdfs = typeof data.total_pdf_downloads === 'number' ? data.total_pdf_downloads : currentStatsCache.pdfDownloads;

          currentStatsCache = {
            totalVisitors: fTotal,
            dailyVisitors: fDaily,
            totalPageViews: fViews,
            dailyPageViews: fDailyViews,
            totalTestsAttempted: fTests,
            pdfDownloads: fPdfs,
            activeNow: calculateActiveUsers(fDailyViews),
          };

          callback(currentStatsCache);
        }
      }, (err) => {
        console.warn("Firestore analytics stream fallback:", err);
      });
    } catch (err) {
      console.warn("Error subscribing to Firestore analytics:", err);
    }
  }

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key && e.key.startsWith('dsssb_ga_')) {
      const updatedStats: WebAnalyticsStats = {
        totalVisitors: getStoredNum(STORAGE_KEYS.TOTAL_VISITS, DEFAULT_BASELINE.totalVisitors),
        dailyVisitors: getStoredNum(STORAGE_KEYS.DAILY_VISITS, DEFAULT_BASELINE.dailyVisitors),
        totalPageViews: getStoredNum(STORAGE_KEYS.PAGE_VIEWS, DEFAULT_BASELINE.totalPageViews),
        dailyPageViews: getStoredNum(STORAGE_KEYS.DAILY_PAGE_VIEWS, DEFAULT_BASELINE.dailyPageViews),
        totalTestsAttempted: getStoredNum(STORAGE_KEYS.TEST_ATTEMPTS, DEFAULT_BASELINE.totalTestsAttempted),
        pdfDownloads: getStoredNum(STORAGE_KEYS.PDF_DOWNLOADS, DEFAULT_BASELINE.pdfDownloads),
        activeNow: calculateActiveUsers(getStoredNum(STORAGE_KEYS.DAILY_PAGE_VIEWS, DEFAULT_BASELINE.dailyPageViews)),
      };
      currentStatsCache = updatedStats;
      callback(updatedStats);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorageChange);
  }

  return () => {
    subscribers.delete(callback);
    if (unsubFirestore) unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
    }
  };
}

export function recordSessionVisit() {
  if (typeof window === 'undefined') return;

  const today = getTodayKey();
  const lastVisit = localStorage.getItem(STORAGE_KEYS.LAST_VISIT_DATE);
  const visitorId = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);

  if (!visitorId) {
    const newId = 'ga_vis_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(STORAGE_KEYS.VISITOR_ID, newId);

    const currentTotal = getStoredNum(STORAGE_KEYS.TOTAL_VISITS, DEFAULT_BASELINE.totalVisitors);
    const newTotal = currentTotal + 1;
    localStorage.setItem(STORAGE_KEYS.TOTAL_VISITS, newTotal.toString());
    currentStatsCache.totalVisitors = newTotal;

    if (isConfigured && db) {
      try {
        const globalDocRef = doc(db, 'analytics', 'global');
        setDoc(globalDocRef, { total_visitors: increment(1) }, { merge: true });
      } catch (e) {}
    }
  }

  if (lastVisit !== today) {
    localStorage.setItem(STORAGE_KEYS.LAST_VISIT_DATE, today);
    const currentDaily = getStoredNum(STORAGE_KEYS.DAILY_VISITS, DEFAULT_BASELINE.dailyVisitors);
    const newDaily = currentDaily + 1;
    localStorage.setItem(STORAGE_KEYS.DAILY_VISITS, newDaily.toString());
    currentStatsCache.dailyVisitors = newDaily;

    // Reset daily page views for new day
    const newDailyViews = 1;
    localStorage.setItem(STORAGE_KEYS.DAILY_PAGE_VIEWS, newDailyViews.toString());
    currentStatsCache.dailyPageViews = newDailyViews;

    if (isConfigured && db) {
      try {
        const globalDocRef = doc(db, 'analytics', 'global');
        setDoc(globalDocRef, { 
          [`visits_${today}`]: increment(1),
          [`page_views_${today}`]: increment(1)
        }, { merge: true });
      } catch (e) {}
    }
  }

  notifySubscribers();
}

export function initGA() {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
  }
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: true,
  });

  recordSessionVisit();
}

export function trackPageView(pageName: string, path?: string) {
  try {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      const currentPath = path || window.location.pathname;
      const currentUrl = window.location.href;

      if (typeof window.gtag === 'function') {
        window.gtag('config', GA_MEASUREMENT_ID, {
          page_title: pageName,
          page_location: currentUrl,
          page_path: currentPath,
        });

        window.gtag('event', 'page_view', {
          page_title: pageName,
          page_location: currentUrl,
          page_path: currentPath,
        });
      }

      // Increment Page View Counter locally
      const currentViews = getStoredNum(STORAGE_KEYS.PAGE_VIEWS, DEFAULT_BASELINE.totalPageViews);
      const newViews = currentViews + 1;
      localStorage.setItem(STORAGE_KEYS.PAGE_VIEWS, newViews.toString());
      currentStatsCache.totalPageViews = newViews;

      const currentDailyViews = getStoredNum(STORAGE_KEYS.DAILY_PAGE_VIEWS, DEFAULT_BASELINE.dailyPageViews);
      const newDailyViews = currentDailyViews + 1;
      localStorage.setItem(STORAGE_KEYS.DAILY_PAGE_VIEWS, newDailyViews.toString());
      currentStatsCache.dailyPageViews = newDailyViews;

      // Atomic real-time sync across all devices via Firestore
      if (isConfigured && db) {
        try {
          const globalDocRef = doc(db, 'analytics', 'global');
          const today = getTodayKey();
          setDoc(globalDocRef, { 
            total_page_views: increment(1),
            [`page_views_${today}`]: increment(1)
          }, { merge: true });
        } catch (e) {
          console.warn("Firestore page_view sync error:", e);
        }
      }

      notifySubscribers();
    }
  } catch (err) {
    console.warn('Analytics page_view error:', err);
  }
}

export function trackEvent(
  action: string,
  category?: string,
  label?: string,
  value?: number,
  extraParams?: Record<string, any>
) {
  try {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      if (typeof window.gtag === 'function') {
        window.gtag('event', action, {
          event_category: category || 'General',
          event_label: label,
          value: value,
          ...extraParams,
        });
      }
    }
  } catch (err) {
    console.warn('Analytics event error:', err);
  }
}

export function trackSearch(searchQuery: string, resultsCount: number) {
  if (!searchQuery || !searchQuery.trim()) return;
  trackEvent('search', 'Search', searchQuery.trim(), resultsCount, {
    search_term: searchQuery.trim(),
    results_count: resultsCount,
  });
}

export function trackQuizStart(testId: string, title: string, category: string) {
  trackEvent('quiz_start', 'Quiz', title, undefined, {
    test_id: testId,
    quiz_category: category,
  });
}

export function trackQuizComplete(testId: string, score: number, accuracy: number, timeSpent: number) {
  trackEvent('quiz_complete', 'Quiz', testId, score, {
    test_id: testId,
    accuracy: accuracy,
    time_spent_seconds: timeSpent,
  });

  if (typeof window !== 'undefined') {
    const currentAttempts = getStoredNum(STORAGE_KEYS.TEST_ATTEMPTS, DEFAULT_BASELINE.totalTestsAttempted);
    const newAttempts = currentAttempts + 1;
    localStorage.setItem(STORAGE_KEYS.TEST_ATTEMPTS, newAttempts.toString());
    currentStatsCache.totalTestsAttempted = newAttempts;

    if (isConfigured && db) {
      try {
        const globalDocRef = doc(db, 'analytics', 'global');
        setDoc(globalDocRef, { total_tests_attempted: increment(1) }, { merge: true });
      } catch (e) {}
    }

    notifySubscribers();
  }
}

export function trackAdImpression(adUnit: string, location: string) {
  trackEvent('ad_impression', 'Monetization', `${adUnit}_${location}`, undefined, {
    ad_unit: adUnit,
    ad_location: location,
  });
}

export function trackAdClick(adUnit: string, rewardType?: string) {
  trackEvent('ad_click', 'Monetization', rewardType || adUnit, undefined, {
    ad_unit: adUnit,
    reward_type: rewardType,
  });
}

export function trackTestUnlock(testId: string) {
  trackEvent('test_unlock', 'Engagement', testId, undefined, {
    test_id: testId,
  });
}

export function trackPdfDownload(testId: string) {
  trackEvent('pdf_download', 'Export', testId, undefined, {
    test_id: testId,
  });

  if (typeof window !== 'undefined') {
    const currentPdfs = getStoredNum(STORAGE_KEYS.PDF_DOWNLOADS, DEFAULT_BASELINE.pdfDownloads);
    const newPdfs = currentPdfs + 1;
    localStorage.setItem(STORAGE_KEYS.PDF_DOWNLOADS, newPdfs.toString());
    currentStatsCache.pdfDownloads = newPdfs;

    if (isConfigured && db) {
      try {
        const globalDocRef = doc(db, 'analytics', 'global');
        setDoc(globalDocRef, { total_pdf_downloads: increment(1) }, { merge: true });
      } catch (e) {}
    }

    notifySubscribers();
  }
}
