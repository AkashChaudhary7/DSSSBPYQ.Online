/**
 * Centralized Mobile Device Redirect Logic
 * Redirects mobile visitors to official Google Play Store app:
 * https://play.google.com/store/apps/details?id=online.dsssbpyq.twa
 */

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=online.dsssbpyq.twa';

export function isMobileUserAgent(ua: string = typeof navigator !== 'undefined' ? navigator.userAgent : ''): boolean {
  if (typeof navigator !== 'undefined') {
    const nav = navigator as any;
    if (nav.userAgentData && typeof nav.userAgentData.mobile === 'boolean') {
      if (nav.userAgentData.mobile) return true;
    }
  }

  const mobileUaRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|Tablet|Touch/i;
  if (mobileUaRegex.test(ua)) return true;

  if (typeof navigator !== 'undefined' && /Macintosh/i.test(ua) && navigator.maxTouchPoints && navigator.maxTouchPoints > 1) {
    return true;
  }

  return false;
}

export function handleMobileRedirect(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const pathname = window.location.pathname.toLowerCase();

    // 1. EXCLUDE AdMob / AdSense verification files
    if (pathname === '/app-ads.txt' || pathname === '/ads.txt') {
      return false;
    }

    // 2. EXCLUDE static assets and system paths
    const staticExtensions = /\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot|xml|txt|pdf|csv)$/i;
    if (staticExtensions.test(pathname)) {
      return false;
    }

    if (
      pathname === '/sw.js' ||
      pathname === '/manifest.json' ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml' ||
      pathname === '/offline.html'
    ) {
      return false;
    }

    // 3. EXCLUDE local development environments
    const hostname = window.location.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    // 4. EXCLUDE explicit noredirect / web override params
    const search = window.location.search.toLowerCase();
    if (search.includes('noredirect') || search.includes('web=1') || search.includes('preview=1')) {
      return false;
    }

    // 5. EXCLUDE search engine crawlers and ad verification bots
    const ua = navigator.userAgent || '';
    const crawlerRegex = /Googlebot|bingbot|yandexbot|DuckDuckBot|slurp|Mediapartners-Google|AdsBot-Google|google-app-manifest|FeedFetcher-Google/i;
    if (crawlerRegex.test(ua)) {
      return false;
    }

    // 6. Check if mobile device
    if (isMobileUserAgent(ua)) {
      window.location.replace(PLAY_STORE_URL);
      return true;
    }
  } catch (err) {
    console.error('[MobileRedirect] Error executing redirect check:', err);
  }

  return false;
}
