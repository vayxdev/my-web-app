import { useEffect } from 'react';

const GoogleAnalytics = ({ measurementId }) => {
  useEffect(() => {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', measurementId);

    // Clean up
    return () => {
      document.head.removeChild(script);
    };
  }, [measurementId]);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics;