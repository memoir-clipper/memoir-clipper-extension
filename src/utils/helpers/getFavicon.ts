/**
 * Retrieves the favicon URL for the current webpage.
 *
 * Searches for favicon-related link elements in order of preference and returns
 * the absolute URL if found. Falls back to '/favicon.ico' if no link is found.
 *
 * @returns The absolute favicon URL, or undefined if not found or URL construction fails.
 */
export function getFaviconUrl(): string | undefined {
    for (const selector of FaviconHelper.SELECTORS) {
        const linkElement = document.querySelector(selector);
        if (linkElement) {
            const href = linkElement.getAttribute('href');
            if (href) {
                try {
                    return new URL(href, window.location.href).href;
                } catch (error) {
                    // Ignore invalid URLs and continue searching
                    continue;
                }
            }
        }
    }

    // Fallback to default favicon location
    try {
        return new URL('/favicon.ico', window.location.origin).href;
    } catch {
        return undefined;
    }
}

/**
 * Helper for favicon selectors.
 */
class FaviconHelper {
    static readonly SELECTORS: string[] = [
        'link[rel="icon"][sizes="32x32"]',
        'link[rel="icon"][sizes="192x192"]',
        'link[rel="apple-touch-icon"]',
        'link[rel="apple-touch-icon-precomposed"]',
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="fluid-icon"]',
        'link[rel="mask-icon"]',
    ];
}
