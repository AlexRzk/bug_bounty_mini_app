/**
 * Mini App Detection Utilities
 * Helps detect if the app is running inside a Farcaster Mini App context
 * 
 * This is a best-effort hint for lazy-loading SDK or SSR optimization.
 * Do NOT use for security-critical decisions.
 */

/**
 * Check if current URL suggests Mini App context (client-side)
 * Detects Farcaster frame/embed context using multiple signals
 */
export function isMiniAppContext(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check for explicit miniApp parameter
  const params = new URLSearchParams(window.location.search)
  if (params.has('miniApp') && params.get('miniApp') === 'true') {
    return true
  }
  
  // Check if we're in an iframe (Farcaster embeds pages in iframes)
  if (window.self !== window.top) {
    return true
  }
  
  // Check for Farcaster-specific referrer
  if (document.referrer.includes('farcaster.xyz') || document.referrer.includes('warpcast.com')) {
    return true
  }
  
  // Check viewport width (Farcaster frames are typically narrow)
  if (window.innerWidth < 500) {
    return true
  }
  
  return false
}

/**
 * Check if URL suggests Mini App context (server-side compatible)
 * @param url - The URL to check (can be from request)
 */
export function isMiniAppUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, 'http://localhost')
    return urlObj.searchParams.has('miniApp') && urlObj.searchParams.get('miniApp') === 'true'
  } catch {
    return false
  }
}

/**
 * Get Mini App marker query parameter
 * Add this to URLs you want to identify as Mini App launches
 */
export function getMiniAppParam(): string {
  return '?miniApp=true'
}

/**
 * Add Mini App marker to a URL
 */
export function addMiniAppMarker(url: string): string {
  try {
    const urlObj = new URL(url, 'http://localhost')
    urlObj.searchParams.set('miniApp', 'true')
    return urlObj.pathname + urlObj.search
  } catch {
    return url + (url.includes('?') ? '&' : '?') + 'miniApp=true'
  }
}
