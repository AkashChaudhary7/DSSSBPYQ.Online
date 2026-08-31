import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { isMobileDevice, isCrawler, isNativeApp } from '../lib/deviceDetection';

export { isMobileDevice, isCrawler, isNativeApp };

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=online.dsssbpyq.twa';
export const DISMISSAL_STORAGE_KEY = 'byteprep_app_install_prompt_dismissed';
export const DISMISSAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days cooldown

export default function MobileAppInstallModal() {
  // Disabled as per request to remove mobile app prompt banners on mobile
  return null;
}
