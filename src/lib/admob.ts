import { BannerAdPosition } from '@capacitor-community/admob';
import {
  initializeAds,
  showRewardedAd,
  showInterstitialAd,
  prepareRewardedAd,
  prepareInterstitialAd,
  showBannerAd,
  hideBannerAd,
  removeBannerAd,
  isBannerActive,
  ADMOB_TEST_CONFIG,
  ADMOB_PROD_CONFIG,
  IS_PROD_MODE,
  ACTIVE_ADMOB_CONFIG,
  RewardedAdResult,
} from '../services/ads/admobService';

export {
  initializeAds,
  showRewardedAd,
  showInterstitialAd,
  prepareRewardedAd,
  prepareInterstitialAd,
  showBannerAd,
  hideBannerAd,
  removeBannerAd,
  isBannerActive,
  ADMOB_TEST_CONFIG,
  ADMOB_PROD_CONFIG,
  IS_PROD_MODE,
  ACTIVE_ADMOB_CONFIG,
};
export type { RewardedAdResult };

// Backward-compatible alias mappings
export const ADMOB_TEST_IDS = {
  appId: ADMOB_TEST_CONFIG.appId,
  banner: ADMOB_TEST_CONFIG.bannerId,
  interstitial: ADMOB_TEST_CONFIG.interstitialId,
  rewarded: ADMOB_TEST_CONFIG.rewardedId,
};

export const ADMOB_PROD_IDS = {
  appId: ADMOB_PROD_CONFIG.appId,
  banner: ADMOB_PROD_CONFIG.bannerId,
  interstitial: ADMOB_PROD_CONFIG.interstitialId,
  rewarded: ADMOB_PROD_CONFIG.rewardedId,
};

export const IS_ADMOB_PROD = IS_PROD_MODE;
export const ACTIVE_ADMOB_IDS = IS_ADMOB_PROD ? ADMOB_PROD_IDS : ADMOB_TEST_IDS;

export async function initAdMob(): Promise<boolean> {
  return initializeAds();
}
