// Performance monitoring component to track Core Web Vitals
import { useEffect } from 'react';

interface PerformanceMonitorProps {
  onMetric?: (metric: { name: string; value: number }) => void;
}

export const PerformanceMonitor = ({ onMetric }: PerformanceMonitorProps) => {
  useEffect(() => {
    // Function to observe and report Core Web Vitals
    const observePerformance = () => {
      // Track First Contentful Paint (FCP)
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          console.log(`FCP: ${entry.startTime.toFixed(2)}ms`);
          onMetric?.({ name: 'FCP', value: entry.startTime });
        }
      });

      // Track Largest Contentful Paint (LCP) using PerformanceObserver
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as PerformanceEntry & { size: number };
            if (lastEntry) {
              console.log(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
              onMetric?.({ name: 'LCP', value: lastEntry.startTime });
            }
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.warn('LCP observer not supported:', error);
        }

        // Track Cumulative Layout Shift (CLS)
        try {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // Type assertion for CLS entries
              const clsEntry = entry as PerformanceEntry & { 
                value: number; 
                hadRecentInput?: boolean; 
              };
              if (!clsEntry.hadRecentInput && clsEntry.value) {
                clsValue += clsEntry.value;
              }
            }
            console.log(`CLS: ${clsValue.toFixed(4)}`);
            onMetric?.({ name: 'CLS', value: clsValue });
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          console.warn('CLS observer not supported:', error);
        }

        // Track First Input Delay (FID)
        try {
          const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // Type assertion for FID entries
              const fidEntry = entry as PerformanceEntry & { 
                processingStart: number; 
              };
              if (fidEntry.processingStart) {
                const fid = fidEntry.processingStart - entry.startTime;
                console.log(`FID: ${fid.toFixed(2)}ms`);
                onMetric?.({ name: 'FID', value: fid });
              }
            }
          });
          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (error) {
          console.warn('FID observer not supported:', error);
        }
      }

      // Track resource loading performance
      const resources = performance.getEntriesByType('resource');
      const slowResources = resources.filter((resource) => resource.duration > 1000);
      
      if (slowResources.length > 0) {
        console.warn('Slow loading resources detected:', slowResources.map(r => ({
          name: r.name,
          duration: `${r.duration.toFixed(2)}ms`
        })));
      }

      // Track navigation timing
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        const domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart;
        const loadComplete = navEntry.loadEventEnd - navEntry.loadEventStart;
        
        console.log(`DOM Content Loaded: ${domContentLoaded.toFixed(2)}ms`);
        console.log(`Load Complete: ${loadComplete.toFixed(2)}ms`);
        
        onMetric?.({ name: 'DOM_CONTENT_LOADED', value: domContentLoaded });
        onMetric?.({ name: 'LOAD_COMPLETE', value: loadComplete });
      }
    };

    // Run performance observation after initial render
    const timeoutId = setTimeout(observePerformance, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onMetric]);

  // This component doesn't render anything
  return null;
};

// Hook for easy integration
export const usePerformanceMonitor = (onMetric?: (metric: { name: string; value: number }) => void) => {
  useEffect(() => {
    // Track bundle size and initial load metrics
    const trackInitialLoad = () => {
      const perfData = performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
      
      if (pageLoadTime > 0) {
        console.log(`Page Load Time: ${pageLoadTime}ms`);
        onMetric?.({ name: 'PAGE_LOAD_TIME', value: pageLoadTime });
      }
      
      if (domReadyTime > 0) {
        console.log(`DOM Ready Time: ${domReadyTime}ms`);
        onMetric?.({ name: 'DOM_READY_TIME', value: domReadyTime });
      }
    };

    if (document.readyState === 'complete') {
      trackInitialLoad();
    } else {
      window.addEventListener('load', trackInitialLoad);
      return () => window.removeEventListener('load', trackInitialLoad);
    }
  }, [onMetric]);
};