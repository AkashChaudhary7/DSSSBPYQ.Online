import React, { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { showRewardedAd, showInterstitialAd } from '../lib/admob';

interface VignetteAdModalProps {
  isOpen: boolean;
  rewardType: 'unlock_test' | 'reattempt' | 'pdf_download';
  details?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VignetteAdModal({
  isOpen,
  onSuccess,
}: VignetteAdModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    if (Capacitor.isNativePlatform()) {
      showRewardedAd(() => {
        onSuccess();
      }).catch(async () => {
        // Fallback to interstitial if rewarded fails
        await showInterstitialAd().catch(() => {});
        onSuccess();
      });
    } else {
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [isOpen, onSuccess]);

  return null;
}
