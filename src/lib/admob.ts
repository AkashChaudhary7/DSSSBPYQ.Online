import { BannerAdPosition, BannerAdSize, BannerAdOptions, AdMob } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import {
  initializeAds,
  showRewardedAd,
  showInterstitialAd,
  prepareRewardedAd,
  prepareInterstitialAd,
  ADMOB_TEST_CONFIG,
  ADMOB_PROD_CONFIG,
  IS_PROD_MODE,
  ACTIVE_ADMOB_CONFIG
} from '../services/ads/admobService';

export {
  initializeAds,
  showRewardedAd,
  showInterstitialAd,
  prepareRewardedAd,
  prepareInterstitialAd,
  ADMOB_TEST_CONFIG,
  ADMOB_PROD_CONFIG,
  IS_PROD_MODE,
  ACTIVE_ADMOB_CONFIG
};

// Aliases for backward compatibility
export const ADMOB_TEST_IDS = {
  appId: ADMOB_TEST_CONFIG.appId,
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: ADMOB_TEST_CONFIG.interstitialId,
  rewarded: ADMOB_TEST_CONFIG.rewardedId,
};

export const ADMOB_PROD_IDS = {
  appId: ADMOB_PROD_CONFIG.appId,
  banner: import.meta.env.VITE_ADMOB_BANNER_ID || ADMOB_TEST_IDS.banner,
  interstitial: ADMOB_PROD_CONFIG.interstitialId,
  rewarded: ADMOB_PROD_CONFIG.rewardedId,
};

export const IS_ADMOB_PROD = IS_PROD_MODE;
export const ACTIVE_ADMOB_IDS = IS_ADMOB_PROD ? ADMOB_PROD_IDS : ADMOB_TEST_IDS;

export async function initAdMob(): Promise<boolean> {
  return initializeAds();
}

/**
 * Optional Banner Ad method (only shown when requested by component)
 */
export async function showBannerAd(
  position: BannerAdPosition = BannerAdPosition.BOTTOM_CENTER
): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  await initializeAds();

  const options: BannerAdOptions = {
    adId: ACTIVE_ADMOB_IDS.banner,
    adSize: BannerAdSize.BANNER,
    position,
    margin: 0,
    isTesting: !IS_ADMOB_PROD,
  };

  try {
    await AdMob.showBanner(options);
    return true;
  } catch (error) {
    console.warn('[AdMob] Show banner failed:', error);
    return false;
  }
}

export async function hideBannerAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await AdMob.hideBanner();
    return true;
  } catch (error) {
    return false;
  }
}

export async function removeBannerAd(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    await AdMob.removeBanner();
    return true;
  } catch (error) {
    return false;
  }
}
