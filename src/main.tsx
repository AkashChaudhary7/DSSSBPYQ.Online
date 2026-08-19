import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { handleMobileRedirect } from './lib/mobileRedirect.ts';
import './index.css';

if (typeof window !== 'undefined') {
  handleMobileRedirect();

  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (event.reason.message === 'Failed to fetch' ||
        event.reason.name === 'TypeError' ||
        String(event.reason).includes('Failed to fetch'))
    ) {
      event.preventDefault();
      console.warn('Network fetch error handled gracefully:', event.reason);
    }
  });

  // Register PWA Service Worker in production / supported environments
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[PWA] Service worker controller updated.');
    });

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered successfully:', reg.scope);

          // Defer non-critical background tasks until idle time
          const runDeferredTasks = () => {
            // Request Notification Permission only if default (not already decided)
            if ('Notification' in window && Notification.permission === 'default') {
              // Non-blocking background permission check
            }

            // Register for Background Sync if supported
            if ('sync' in reg) {
              // @ts-ignore
              reg.sync.register('sync-data')
                .then(() => console.log('[PWA] Background sync registered'))
                .catch(() => {});
            }

            // Register for Periodic Sync if supported
            if ('periodicSync' in reg) {
              navigator.permissions?.query({ name: 'periodic-background-sync' as PermissionName }).then((status) => {
                if (status.state === 'granted') {
                  // @ts-ignore
                  reg.periodicSync.register('fetch-latest-content', {
                    minInterval: 24 * 60 * 60 * 1000 // 1 day
                  }).catch(() => {});
                }
              }).catch(() => {});
            }
          };

          if ('requestIdleCallback' in window) {
            requestIdleCallback(runDeferredTasks, { timeout: 3000 });
          } else {
            setTimeout(runDeferredTasks, 3000);
          }
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


