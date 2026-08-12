import { Capacitor } from '@capacitor/core';
import { showInterstitialAd } from '../services/ads/admobService';

/**
 * Configurable Interstitial Advertisement Frequency Rules
 * 
 * Rules:
 * - Default frequency: Show interstitial every 1 submission (configurable via dsssb_interstitial_frequency)
 * - Minimum cooldown interval: 30 seconds between consecutive interstitials
 * - Prevents overlapping ads & rapid double submissions
 * - Non-blocking safety fallback if ad fails or is skipped
 */

const STORAGE_KEYS = {
  SUBMISSION_COUNT: 'dsssb_interstitial_sub_count_v5',
  LAST_INTERSTITIAL_TIME: 'dsssb_last_interstitial_time_v5',
  FREQUENCY_SETTING: 'dsssb_interstitial_frequency',
};

// Default frequency: 1 (every 1 quiz submission). Can be configured via env or storage.
const DEFAULT_FREQUENCY = parseInt(import.meta.env.VITE_ADMOB_INTERSTITIAL_FREQUENCY || '1', 10);
const MIN_COOLDOWN_MS = 30000; // 30 seconds

let isShowingInterstitial = false;

export function getSubmissionCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem(STORAGE_KEYS.SUBMISSION_COUNT);
    return val ? parseInt(val, 10) : 0;
  } catch (_) {
    return 0;
  }
}

export function incrementSubmissionCount(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const current = getSubmissionCount();
    const next = current + 1;
    localStorage.setItem(STORAGE_KEYS.SUBMISSION_COUNT, next.toString());
    return next;
  } catch (_) {
    return 1;
  }
}

export function getLastInterstitialTime(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem(STORAGE_KEYS.LAST_INTERSTITIAL_TIME);
    return val ? parseInt(val, 10) : 0;
  } catch (_) {
    return 0;
  }
}

export function recordInterstitialTime(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_INTERSTITIAL_TIME, Date.now().toString());
  } catch (_) {}
}

export function getInterstitialFrequency(): number {
  if (typeof window === 'undefined') return DEFAULT_FREQUENCY;
  try {
    const val = localStorage.getItem(STORAGE_KEYS.FREQUENCY_SETTING);
    return val ? parseInt(val, 10) : DEFAULT_FREQUENCY;
  } catch (_) {
    return DEFAULT_FREQUENCY;
  }
}

export function setInterstitialFrequency(freq: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.FREQUENCY_SETTING, Math.max(1, freq).toString());
  } catch (_) {}
}

/**
 * Checks if the current submission meets the frequency & cooldown rules to display an Interstitial ad.
 */
export function shouldShowInterstitial(): boolean {
  const subCount = getSubmissionCount();
  const lastTime = getLastInterstitialTime();
  const now = Date.now();
  const freq = getInterstitialFrequency();

  const matchesFrequency = subCount % freq === 0;
  const satisfiesCooldown = (now - lastTime) >= MIN_COOLDOWN_MS;

  return matchesFrequency && satisfiesCooldown;
}

/**
 * Safely presents the post-quiz submit Interstitial ad.
 * Returns true if ad displayed, false if skipped/failed.
 * Always resolves without throwing or hanging, ensuring user proceeds to ResultScreen.
 */
export async function presentPostQuizInterstitial(): Promise<boolean> {
  // Prevent concurrent/overlapping interstitial displays
  if (isShowingInterstitial) {
    console.warn('[InterstitialRules] Interstitial display already in progress. Skipping.');
    return false;
  }

  isShowingInterstitial = true;

  try {
    const subCount = incrementSubmissionCount();
    const freq = getInterstitialFrequency();
    const lastTime = getLastInterstitialTime();
    const now = Date.now();

    const matchesFrequency = subCount % freq === 0;
    const satisfiesCooldown = (now - lastTime) >= MIN_COOLDOWN_MS;

    if (!matchesFrequency || !satisfiesCooldown) {
      console.log(`[InterstitialRules] Interstitial skipped. Submissions: ${subCount}, Freq: ${freq}, Cooldown OK: ${satisfiesCooldown}`);
      return false;
    }

    if (!Capacitor.isNativePlatform()) {
      console.log('[InterstitialRules] Non-native platform. Interstitial skipped.');
      return false;
    }

    recordInterstitialTime();
    console.log('[InterstitialRules] Requesting Interstitial display...');
    const adShown = await showInterstitialAd();
    return adShown;
  } catch (err) {
    console.warn('[InterstitialRules] Error during interstitial display:', err);
    return false;
  } finally {
    isShowingInterstitial = false;
  }
}
