import { useEffect, useRef, useState } from 'react';

export default function AdSense({
  adSlot = '1860840872',
  adFormat = 'auto',
  adLayout = null,
  fullWidthResponsive = true,
}) {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const loadAd = () => {
      try {
        if (window.adsbygoogle && adRef.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});

          // Check if ad loaded after a delay
          setTimeout(() => {
            if (adRef.current) {
              const adElement = adRef.current;
              const hasAd = adElement.getAttribute('data-ad-status') === 'filled' ||
                           adElement.querySelector('iframe') !== null ||
                           adElement.clientHeight > 0;
              setAdLoaded(hasAd);
            }
          }, 1000);
        }
      } catch (e) {
        console.error('AdSense error:', e);
        setAdLoaded(false);
      }
    };

    loadAd();
  }, []);

  // In-article ad style
  const isInArticle = adLayout === 'in-article';
  const adStyle = isInArticle
    ? { display: 'block', textAlign: 'center' }
    : { display: 'block' };

  return (
    <div
      ref={adRef}
      className={`ad-container transition-all duration-300 ${adLoaded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}
    >
      <ins
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
