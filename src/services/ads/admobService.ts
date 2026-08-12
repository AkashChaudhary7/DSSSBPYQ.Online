import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  AdOptions,
  RewardAdPluginEvents,
  AdMobRewardItem,
  AdLoadInfo,
} from '@capacitor-community/admob';

/**
 * ============================================================================
 * GOOGLE ADMOB CONFIGURATION LAYER
 * ============================================================================
 * Official Google AdMob Test Ad Unit IDs for development and testing.
 * Reference: https://developers.google.com/admob/android/test-ads
 */
export const ADMOB_TEST_CONFIG = {
  appId: 'ca-app-pub-3940256099942544~3347511713',
  interstitialId: 'ca-app-pub-3940256099942544/1033173712',
  rewardedId: 'ca-app-pub-3940256099942544/5224354917',
};

/**
 * PRODUCTION CONFIGURATION
 * Developers insert real production AdMob IDs via environment variables:
 * - VITE_ADMOB_IS_PROD: Set to 'true' in production builds
 * - VITE_ADMOB_APP_ID: Your production AdMob Application ID
 * - VITE_ADMOB_INTERSTITIAL_ID: Your production Interstitial Ad Unit ID
 * - VITE_ADMOB_REWARDED_ID: Your production Rewarded Video Ad Unit ID
 */
export const ADMOB_PROD_CONFIG = {
  appId: import.meta.env.VITE_ADMOB_APP_ID || ADMOB_TEST_CONFIG.appId,
  interstitialId: import.meta.env.VITE_ADMOB_INTERSTITIAL_ID || ADMOB_TEST_CONFIG.interstitialId,
  rewardedId: import.meta.env.VITE_ADMOB_REWARDED_ID || ADMOB_TEST_CONFIG.rewardedId,
};

export const IS_PROD_MODE = import.meta.env.VITE_ADMOB_IS_PROD === 'true';

export const ACTIVE_ADMOB_CONFIG = IS_PROD_MODE ? ADMOB_PROD_CONFIG : ADMOB_TEST_CONFIG;

let isInitialized = false;
let isInitializing = false;

/**
 * Initialize Google Mobile Ads SDK inside Capacitor Android container.
 * Idempotent, safe against re-entrancy and offline failures.
 */
export async function initializeAds(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob Service] Non-native web environment detected. AdMob init skipped.');
    return false;
  }

  if (isInitialized) {
    return true;
  }

  if (isInitializing) {
    return false;
  }

  isInitializing = true;

  try {
    const initPromise = AdMob.initialize({
      initializeForTesting: !IS_PROD_MODE,
    });

    // 5-second timeout guard for initialization to prevent hanging on poor connectivity
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AdMob init timeout')), 5000)
    );

    await Promise.race([initPromise, timeoutPromise]);
    isInitialized = true;
    console.log('[AdMob Service] Initialized successfully. Config:', ACTIVE_ADMOB_CONFIG);
    return true;
  } catch (error) {
    console.warn('[AdMob Service] Initialization warning/failure:', error);
    return false;
  } finally {
    isInitializing = false;
  }
}

/**
 * Preloads an Interstitial Ad into memory.
 */
export async function prepareInterstitialAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  await initializeAds();

  const options: AdOptions = {
    adId: ACTIVE_ADMOB_CONFIG.interstitialId,
    isTesting: !IS_PROD_MODE,
  };

  try {
    await AdMob.prepareInterstitial(options);
    console.log('[AdMob Service] Interstitial ad prepared successfully.');
    return true;
  } catch (error) {
    console.warn('[AdMob Service] Interstitial prepare failed:', error);
    return false;
  }
}

/**
 * Displays an Interstitial Ad with built-in safety timeout and failure handling.
 */
export async function showInterstitialAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  const initialized = await initializeAds();
  if (!initialized) return false;

  try {
    const prepared = await prepareInterstitialAd();
    if (!prepared) {
      console.warn('[AdMob Service] Skipping interstitial presentation because preparation failed.');
      return false;
    }

    const showPromise = AdMob.showInterstitial();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Interstitial display timeout')), 8000)
    );

    await Promise.race([showPromise, timeoutPromise]);
    console.log('[AdMob Service] Interstitial ad presented successfully.');
    return true;
  } catch (error) {
    console.warn('[AdMob Service] Interstitial ad presentation failed:', error);
    return false;
  }
}

/**
 * Preloads a Rewarded Video Ad into memory.
 */
export async function prepareRewardedAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  await initializeAds();

  const options: AdOptions = {
    adId: ACTIVE_ADMOB_CONFIG.rewardedId,
    isTesting: !IS_PROD_MODE,
  };

  try {
    await AdMob.prepareRewardVideoAd(options);
    console.log('[AdMob Service] Rewarded ad prepared successfully.');
    return true;
  } catch (error) {
    console.warn('[AdMob Service] Rewarded ad prepare failed:', error);
    return false;
  }
}

/**
 * Displays a Rewarded Video Ad with event listeners and safety fallback callbacks.
 * Executes onRewardEarned callback if user successfully watches video.
 */
export async function showRewardedAd(
  onRewardEarned?: (reward: AdMobRewardItem) => void
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  const initialized = await initializeAds();
  if (!initialized) return false;

  let rewardEarned = false;

  try {
    const rewardListener = await AdMob.addListener(
      RewardAdPluginEvents.Rewarded,
      (reward: AdMobRewardItem) => {
        console.log('[AdMob Service] User earned reward:', reward);
        rewardEarned = true;
        if (onRewardEarned) {
          onRewardEarned(reward);
        }
      }
    );

    const prepared = await prepareRewardedAd();
    if (!prepared) {
      console.warn('[AdMob Service] Skipping rewarded ad presentation because preparation failed.');
      rewardListener.remove();
      return false;
    }

    const showPromise = AdMob.showRewardVideoAd();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Rewarded ad presentation timeout')), 10000)
    );

    await Promise.race([showPromise, timeoutPromise]);
    console.log('[AdMob Service] Rewarded ad shown successfully.');
    
    // Clean up listener after short delay
    setTimeout(() => {
      rewardListener.remove();
    }, 2000);

    return true;
  } catch (error) {
    console.warn('[AdMob Service] Rewarded ad presentation failed:', error);
    return false;
  }
}
