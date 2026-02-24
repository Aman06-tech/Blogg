/**
 * Utility functions for search engine notifications
 */

/**
 * Ping search engines to notify them of sitemap updates
 * This helps search engines discover new content faster
 */
export const notifySearchEngines = async (siteUrl) => {
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  const pingUrls = [
    // Google
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    // Bing
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];

  const results = [];

  for (const url of pingUrls) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'User-Agent': 'DailyBloggs-Sitemap-Bot/1.0' }
      });

      if (response.ok) {
        const engine = url.includes('google') ? 'Google' : 'Bing';
        console.log(`✅ Successfully pinged ${engine} about sitemap update`);
        results.push({ engine, success: true });
      } else {
        const engine = url.includes('google') ? 'Google' : 'Bing';
        console.warn(`⚠️ Failed to ping ${engine}: ${response.status}`);
        results.push({ engine, success: false, status: response.status });
      }
    } catch (error) {
      const engine = url.includes('google') ? 'Google' : 'Bing';
      console.error(`❌ Error pinging ${engine}:`, error.message);
      results.push({ engine, success: false, error: error.message });
    }
  }

  return results;
};

/**
 * Notify search engines about a specific URL (IndexNow protocol)
 * This is faster than waiting for sitemap crawl
 */
export const notifyIndexNow = async (url, siteUrl) => {
  try {
    // IndexNow API (supported by Bing and others)
    const indexNowUrl = 'https://api.indexnow.org/indexnow';

    const response = await fetch(`${indexNowUrl}?url=${encodeURIComponent(url)}&key=your-api-key-here`, {
      method: 'GET',
      headers: { 'User-Agent': 'DailyBloggs-IndexNow-Bot/1.0' }
    });

    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`✅ Successfully submitted URL to IndexNow: ${url}`);
      return { success: true };
    } else {
      console.warn(`⚠️ IndexNow returned status ${response.status}`);
      return { success: false, status: response.status };
    }
  } catch (error) {
    console.error('❌ Error with IndexNow:', error.message);
    return { success: false, error: error.message };
  }
};
