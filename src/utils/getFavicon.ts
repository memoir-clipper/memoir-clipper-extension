/**
 * Retrieves the favicon URL for the current webpage.
 *
 * This function searches for favicon URLs in the document by trying various selectors
 * in order of preference. It looks for different favicon-related link elements such as
 * standard icons, Apple touch icons, shortcut icons, etc.
 *
 * The function attempts to convert relative URLs to absolute URLs using the current
 * window location as the base.
 *
 * @returns A string containing the absolute URL of the favicon if found,
 *          or undefined if no favicon could be determined or if URL construction fails.
 */
export function getFaviconUrl(): string | undefined {
    for (const selector of FAVICON_SELECTORS) {
        const linkElement = document.querySelector(selector);
        if (linkElement) {
            const href = linkElement.getAttribute('href');
            if (href) {
                try {
                    return new URL(href, window.location.href).href;
                } catch {
                    continue;
                }
            }
        }
    }

    try {
        return new URL('/favicon.ico', window.location.origin).href;
    } catch {
        return undefined;
    }
}

// Favicon selectors to find the best available favicon
const FAVICON_SELECTORS = [
    'link[rel="icon"][sizes="32x32"]',
    'link[rel="icon"][sizes="192x192"]',
    'link[rel="apple-touch-icon"]',
    'link[rel="apple-touch-icon-precomposed"]',
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="fluid-icon"]',
    'link[rel="mask-icon"]',
];
