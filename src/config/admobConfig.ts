/**
 * ============================================================================
 * CENTRALIZED GOOGLE ADMOB CONFIGURATION
 * ============================================================================
 * 
 * Location: src/config/admobConfig.ts
 * 
 * PRODUCTION INSTRUCTIONS:
 * 1. Replace the placeholders below with your official production AdMob IDs.
 * 2. You can also supply them via environment variables:
 *    - VITE_ADMOB_APP_ID
 *    - VITE_ADMOB_BANNER_ID
 *    - VITE_ADMOB_INTERSTITIAL_ID
 *    - VITE_ADMOB_REWARDED_ID
 * 3. Also update the App ID in android/app/src/main/res/values/strings.xml
 */

// ============================================================================
// 1. YOUR REAL / PRODUCTION ADMOB CONFIGURATION
// ============================================================================
export const REAL_ADMOB_CONFIG = {
  // Real AdMob Application ID
  appId: import.meta.env.VITE_ADMOB_APP_ID || 'ca-app-pub-9282190735069880~9460914393',

  // [PASTE MY REAL BANNER AD UNIT ID HERE] (Format: ca-app-pub-9282190735069880/XXXXXXXXXX)
  bannerId: import.meta.env.VITE_ADMOB_BANNER_ID || '[PASTE MY REAL BANNER AD UNIT ID HERE]',

  // Real Interstitial Ad Unit ID
  interstitialId: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-9282190735069880/4120171382',

  // Real Mock Unlock (Rewarded Video) Ad Unit ID
  rewardedId: import.meta.env.VITE_ADMOB_REWARDED_ID || 'ca-app-pub-9282190735069880/6115851742',
};

// ============================================================================
// 2. OFFICIAL GOOGLE TEST CONFIGURATION (Reference: developers.google.com/admob/android/test-ads)
// ============================================================================
export const GOOGLE_TEST_CONFIG = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  bannerId: 'ca-app-pub-3940256099942544/6300978111',
  interstitialId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedId: 'ca-app-pub-3940256099942544/5224354917',
};

// ============================================================================
// 3. DEVELOPMENT / TEST SWITCH
// ============================================================================
// When ADMOB_TEST_MODE is false: Uses your REAL AdMob IDs.
// When ADMOB_TEST_MODE is true: Uses official Google test IDs for development/debugging.
// By default, it is false (or controlled via VITE_ADMOB_TEST_MODE environment variable).
export const ADMOB_TEST_MODE: boolean = import.meta.env.VITE_ADMOB_TEST_MODE === 'true';

// Helper to check if real ID is configured (not placeholder)
export function isRealIdProvided(id: string): boolean {
  return typeof id === 'string' && id.startsWith('ca-app-pub-') && !id.includes('[PASTE');
}

/**
 * Active configuration used throughout the entire application.
 * Automatically resolves to Real IDs unless test mode is explicitly enabled.
 * Falls back safely to Google Test Unit IDs if a real placeholder has not been filled yet.
 */
export const ACTIVE_ADMOB_CONFIG = {
  appId: !ADMOB_TEST_MODE && isRealIdProvided(REAL_ADMOB_CONFIG.appId)
    ? REAL_ADMOB_CONFIG.appId
    : GOOGLE_TEST_CONFIG.appId,

  bannerId: !ADMOB_TEST_MODE && isRealIdProvided(REAL_ADMOB_CONFIG.bannerId)
    ? REAL_ADMOB_CONFIG.bannerId
    : GOOGLE_TEST_CONFIG.bannerId,

  interstitialId: !ADMOB_TEST_MODE && isRealIdProvided(REAL_ADMOB_CONFIG.interstitialId)
    ? REAL_ADMOB_CONFIG.interstitialId
    : GOOGLE_TEST_CONFIG.interstitialId,

  rewardedId: !ADMOB_TEST_MODE && isRealIdProvided(REAL_ADMOB_CONFIG.rewardedId)
    ? REAL_ADMOB_CONFIG.rewardedId
    : GOOGLE_TEST_CONFIG.rewardedId,
};

export const IS_TEST_MODE = ADMOB_TEST_MODE || !isRealIdProvided(REAL_ADMOB_CONFIG.appId);
