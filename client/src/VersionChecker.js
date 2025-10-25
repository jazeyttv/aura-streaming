import { useEffect } from 'react';

const APP_VERSION = '\';
const VERSION_KEY = 'aura_app_version';
const LAST_CHECK_KEY = 'aura_last_check';

const VersionChecker = () => {
  useEffect(() => {
    const checkVersion = async () => {
      try {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        const lastCheck = localStorage.getItem(LAST_CHECK_KEY);
        const now = Date.now();
        
        // Check if version changed OR if it's been more than 1 minute since last check
        const shouldCheck = !lastCheck || (now - parseInt(lastCheck)) > 60000;
        
        if (storedVersion !== APP_VERSION) {
          console.log('🔄 New version detected! Clearing all caches...');
          console.log(`Old version: ${storedVersion || 'none'}, New version: ${APP_VERSION}`);
          
          // 1. Clear all service worker caches
          if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('✅ Cleared service worker caches');
          }
          
          // 2. Unregister service workers
          if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map(reg => reg.unregister()));
            console.log('✅ Unregistered service workers');
          }
          
          // 3. Clear localStorage except auth token
          const token = localStorage.getItem('token');
          const user = localStorage.getItem('user');
          localStorage.clear();
          if (token) localStorage.setItem('token', token);
          if (user) localStorage.setItem('user', user);
          
          // 4. Update version and timestamp
          localStorage.setItem(VERSION_KEY, APP_VERSION);
          localStorage.setItem(LAST_CHECK_KEY, now.toString());
          
          // 5. Force hard reload without cache
          console.log('🔄 Reloading page with fresh cache...');
          window.location.href = window.location.href.split('?')[0] + '?v=' + Date.now();
        } else if (shouldCheck) {
          // Periodic check - update timestamp
          localStorage.setItem(LAST_CHECK_KEY, now.toString());
          console.log(`✅ App version ${APP_VERSION} - up to date (checked: ${new Date().toLocaleTimeString()})`);
        } else {
          console.log(`✅ App version ${APP_VERSION} - recently checked`);
        }
      } catch (error) {
        console.error('❌ Version check error:', error);
      }
    };
    
    checkVersion();
    
    // Check version every minute
    const interval = setInterval(checkVersion, 60000);
    return () => clearInterval(interval);
  }, []);

  return null;
};

export default VersionChecker;

