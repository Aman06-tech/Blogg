import { useEffect, useRef, useState } from 'react';

export default function AdSense({
  adSlot = '1860840872',
  adFormat = 'auto',
  adLayout = null,
  fullWidthResponsive = true,
}) {
  const insRef = useRef(null);
  const [adStatus, setAdStatus] = useState('loading'); // 'loading', 'filled', 'unfilled'

  useEffect(() => {
    const insElement = insRef.current;
    if (!insElement) return;

    // Push ad request
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
      setAdStatus('unfilled');
      return;
    }

    // Use MutationObserver to detect when ad status changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-ad-status') {
          const status = insElement.getAttribute('data-ad-status');
          setAdStatus(status === 'filled' ? 'filled' : 'unfilled');
        }
      });
    });

    observer.observe(insElement, { attributes: true });

    // Fallback: check after delay if no mutation occurred
    const fallbackTimer = setTimeout(() => {
      const status = insElement.getAttribute('data-ad-status');
      if (status) {
        setAdStatus(status === 'filled' ? 'filled' : 'unfilled');
      } else {
        // Check if iframe exists (ad loaded without status attribute)
        const hasIframe = insElement.querySelector('iframe') !== null;
        setAdStatus(hasIframe ? 'filled' : 'unfilled');
      }
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  // In-article ad style
  const isInArticle = adLayout === 'in-article';
  const adStyle = isInArticle
    ? { display: 'block', textAlign: 'center' }
    : { display: 'block' };

  // Hide container if ad is unfilled
  if (adStatus === 'unfilled') {
    return null;
  }

  return (
    <div
      className={`ad-container transition-all duration-300 ${
        adStatus === 'filled' ? 'opacity-100' : 'opacity-50'
      }`}
    >
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={adStyle}
        data-ad-client="ca-pub-1205707348582831"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        {...(adLayout && { 'data-ad-layout': adLayout })}
        {...(!isInArticle && { 'data-full-width-responsive': fullWidthResponsive.toString() })}
      />
    </div>
  );
}
