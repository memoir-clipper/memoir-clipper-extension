// --- Imports ---
import { logger } from '@/utils/helpers/logger';

// --- DOM Manipulation ---

function createTailwindLink(): HTMLLinkElement {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('src/styles/tailwind.css');
    return link;
}

// --- Tailwind Injection ---

/**
 * Inject Tailwind CSS into the current document.
 */
export function injectTailwind(): void {
    try {
        const link = createTailwindLink();
        document.head.appendChild(link);
        logger.info('Tailwind CSS injected successfully');
    } catch (error) {
        logger.error('Failed to inject Tailwind CSS:', error);
    }
}
