import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import {
  AdMob,
  AdOptions,
  BannerAdPosition,
  BannerAdSize,
  BannerAdOptions,
  RewardAdPluginEvents,
  AdMobRewardItem,
  InterstitialAdPluginEvents,
  BannerAdPluginEvents,
} from '@capacitor-community/admob';
import {
  REAL_ADMOB_CONFIG,
  GOOGLE_TEST_CONFIG,
  ADMOB_TEST_MODE,
  ACTIVE_ADMOB_CONFIG,
  IS_TEST_MODE,
  isRealIdProvided,
} from '../../config/admobConfig';

export {
  REAL_ADMOB_CONFIG,
  GOOGLE_TEST_CONFIG,
  ADMOB_TEST_MODE,
  ACTIVE_ADMOB_CONFIG,
  IS_TEST_MODE,
  isRealIdProvided,
};

// Aliases for backwards compatibility
export const ADMOB_TEST_CONFIG = GOOGLE_TEST_CONFIG;
export const ADMOB_PROD_CONFIG = REAL_ADMOB_CONFIG;
export const IS_PROD_MODE = !IS_TEST_MODE;

// Internal lifecycle state tracking
let isInitialized = false;
let isInitializing = false;
let isBannerShowing = false;
let isShowingRewarded = false;
let isShowingInterstitial = false;
let isPreparingInterstitial = false;
let isPreparingRewarded = false;

/**
 * Initialize Google Mobile Ads SDK inside Capacitor Android container.
 * Idempotent, non-blocking, safe against re-entrancy and offline failures.
 */
export async function initializeAds(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob Service] Non-native web environment detected. Native AdMob init skipped.');
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
      initializeForTesting: IS_TEST_MODE,
    });

    // 5-second timeout guard to prevent hanging during poor network
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AdMob initialization timeout')), 5000)
    );

    await Promise.race([initPromise, timeoutPromise]);
    isInitialized = true;
    console.log('[AdMob Service] Native Mobile Ads initialized successfully. TestMode:', IS_TEST_MODE);

    // Warm up background preloading
    setTimeout(() => {
      prepareInterstitialAd().catch(() => {});
      prepareRewardedAd().catch(() => {});
    }, 1000);

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
  if (isPreparingInterstitial) return false;

  await initializeAds();

  const options: AdOptions = {
    adId: ACTIVE_ADMOB_CONFIG.interstitialId,
    isTesting: IS_TEST_MODE,
  };

  isPreparingInterstitial = true;
  try {
    await AdMob.prepareInterstitial(options);
    console.log('[AdMob Service] Interstitial ad prepared with ID:', options.adId);
    return true;
  } catch (error) {
    console.warn('[AdMob Service] Interstitial prepare warning:', error);
    return false;
  } finally {
    isPreparingInterstitial = false;
  }
}

/**
 * Displays an Interstitial Ad with safety timeout and non-blocking failure handling.
 * Automatically preloads the next interstitial after display.
 */
export async function showInterstitialAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  if (isShowingInterstitial) {
    console.warn('[AdMob Service] Interstitial already displaying.');
    return false;
  }

  const initialized = await initializeAds();
  if (!initialized) return false;

  isShowingInterstitial = true;

  try {
    const prepared = await prepareInterstitialAd();
    if (!prepared) {
      console.warn('[AdMob Service] Skipping interstitial: preparation failed.');
      return false;
    }

    const showPromise = AdMob.showInterstitial();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Interstitial display timeout')), 8000)
    );

    await Promise.race([showPromise, timeoutPromise]);
    console.log('[AdMob Service] Interstitial ad presented successfully.');

    // Preload next interstitial in background after consumption
    setTimeout(() => {
      prepareInterstitialAd().catch(() => {});
    }, 2000);

    return true;
  } catch (error) {
    console.warn('[AdMob Service] Interstitial display failed:', error);
    return false;
  } finally {
    isShowingInterstitial = false;
  }
}

/**
 * Preloads a Rewarded Video Ad into memory.
 */
export async function prepareRewardedAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  if (isPreparingRewarded) return false;

  await initializeAds();

  const options: AdOptions = {
    adId: ACTIVE_ADMOB_CONFIG.rewardedId,
    isTesting: IS_TEST_MODE,
  };

  isPreparingRewarded = true;
  try {
    await AdMob.prepareRewardVideoAd(options);
    console.log('[AdMob Service] Rewarded video prepared with ID:', options.adId);
    return true;
  } catch (error) {
    console.warn('[AdMob Service] Rewarded video prepare warning:', error);
    return false;
  } finally {
    isPreparingRewarded = false;
  }
}

export interface RewardedAdResult {
  success: boolean;
  rewardEarned: boolean;
  reward?: AdMobRewardItem;
  error?: string;
}

/**
 * Displays a Rewarded Video Ad.
 * CRITICAL RULE: Resolves with true ONLY if the official RewardAdPluginEvents.Rewarded
 * callback fires and confirms the user earned the reward.
 * If user closes the ad early, or if ad fails to show/load, returns false.
 * Preloads next rewarded ad in background after consumption.
 */
export async function showRewardedAd(
  onRewardEarned?: (reward: AdMobRewardItem) => void
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  if (isShowingRewarded) {
    console.warn('[AdMob Service] Rewarded ad already in progress.');
    return false;
  }

  const initialized = await initializeAds();
  if (!initialized) return false;

  isShowingRewarded = true;
  let rewardEarned = false;
  const handles: PluginListenerHandle[] = [];

  const cleanupListeners = () => {
    handles.forEach((h) => {
      try {
        h.remove();
      } catch (_) {}
    });
    handles.length = 0;
  };

  try {
    // 1. Attach listener for the official Rewarded event
    const rewardHandle = await AdMob.addListener(
      RewardAdPluginEvents.Rewarded,
      (reward: AdMobRewardItem) => {
        console.log('[AdMob Service] Rewarded callback received from Google AdMob:', reward);
        rewardEarned = true;
        if (onRewardEarned) {
          onRewardEarned(reward);
        }
      }
    );
    handles.push(rewardHandle);

    // 2. Prepare ad
    const prepared = await prepareRewardedAd();
    if (!prepared) {
      console.warn('[AdMob Service] Rewarded ad preparation failed.');
      cleanupListeners();
      return false;
    }

    // 3. Show ad with timeout
    const showPromise = AdMob.showRewardVideoAd();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Rewarded ad display timeout')), 12000)
    );

    await Promise.race([showPromise, timeoutPromise]);
    console.log('[AdMob Service] Rewarded ad completed. Reward earned:', rewardEarned);

    // Preload next rewarded ad in background
    setTimeout(() => {
      prepareRewardedAd().catch(() => {});
    }, 2000);

    return rewardEarned;
  } catch (error: any) {
    console.warn('[AdMob Service] Rewarded ad display error:', error);
    return false;
  } finally {
    isShowingRewarded = false;
    setTimeout(cleanupListeners, 2000);
  }
}

/**
 * Shows an adaptive / standard Banner Ad at the bottom center.
 */
export async function showBannerAd(
  position: BannerAdPosition = BannerAdPosition.BOTTOM_CENTER
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  await initializeAds();

  const options: BannerAdOptions = {
    adId: ACTIVE_ADMOB_CONFIG.bannerId,
    adSize: BannerAdSize.BANNER,
    position,
    margin: 0,
    isTesting: IS_TEST_MODE,
  };

  try {
    await AdMob.showBanner(options);
    isBannerShowing = true;
    console.log('[AdMob Service] Banner ad displayed at', position, 'ID:', options.adId);
    return true;
  } catch (error) {
    console.warn('[AdMob Service] Show banner warning:', error);
    return false;
  }
}

/**
 * Hides the current Banner Ad without destroying it.
 */
export async function hideBannerAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await AdMob.hideBanner();
    isBannerShowing = false;
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Removes and destroys the current Banner Ad.
 */
export async function removeBannerAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await AdMob.removeBanner();
    isBannerShowing = false;
    return true;
  } catch (error) {
    return false;
  }
}

export function isBannerActive(): boolean {
  return isBannerShowing;
}
