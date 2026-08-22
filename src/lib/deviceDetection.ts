/**
 * Utility module for device detection, crawler identification, and native app / TWA state checks.
 */

export function isCrawler(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const crawlerRegex = /Googlebot|bingbot|yandexbot|DuckDuckBot|slurp|Mediapartners-Google|AdsBot-Google|google-app-manifest|FeedFetcher-Google|Lighthouse|PageSpeed|Chrome-Lighthouse/i;
  return crawlerRegex.test(ua);
}

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  try {
    // 1. Check navigator.userAgentData (modern Chromium browsers)
    const nav = navigator as any;
    if (nav.userAgentData && typeof nav.userAgentData.mobile === 'boolean') {
      if (nav.userAgentData.mobile) return true;
    }

    // 2. User Agent regex test for mobile phones / tablets
    const ua = navigator.userAgent || '';
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|Tablet|Touch|Kindle|Silk/i;
    if (mobileRegex.test(ua)) return true;

    // 3. iPadOS 13+ detection (Macintosh UA with touch points > 1)
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1) {
      return true;
    }

    // 4. Touch capability & viewport width test (under 1024px with touch screen)
    if (window.innerWidth <= 1024 && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
      // Exclude standard desktop OSes unless they explicitly identified as touch mobile
      if (!/Windows NT|Macintosh|X11|Linux x86_64/i.test(ua) || /Touch/i.test(ua)) {
        return true;
      }
    }
  } catch {
    // Silent fallback
  }

  return false;
}

export function isNativeApp(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  try {
    const ua = navigator.userAgent || '';

    // A. Check for custom app User-Agent strings (TWA, WebView, Capacitor, etc.)
    if (/online\.dsssbpyq\.twa|dsssbpyq|TWA|wv|WebView|AndroidApp|Capacitor|Cordova/i.test(ua)) {
      return true;
    }

    // B. Check for Standalone display mode (installed Android TWA or PWA)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.matchMedia('(display-mode: minimal-ui)').matches
    ) {
      return true;
    }

    if ((navigator as any).standalone === true) {
      return true;
    }

    // C. Check document.referrer for android-app:// or package id
    if (typeof document !== 'undefined' && document.referrer) {
      if (document.referrer.includes('android-app://') || document.referrer.includes('online.dsssbpyq.twa')) {
        return true;
      }
    }

    // D. Check for native bridge properties on window
    const win = window as any;
    if (win.Android || win.Capacitor || win.isNativeApp || win.twa || win.AndroidBridge) {
      return true;
    }

    // E. Check URL query parameters for app flags
    const search = window.location.search || '';
    if (/[?&](app|twa|native|source=app|utm_source=twa|display=standalone)=/i.test(search)) {
      return true;
    }
  } catch {
    // Silent fallback
  }

  return false;
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  if (/Macintosh/i.test(ua) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1) return true;
  return false;
}
