/**
 * Injects Tailwind CSS into the current document by appending a link element
 * to the document head.
 *
 * @remarks
 * This should be called in content scripts or extension pages where Tailwind styling
 * is required but cannot be included directly.
 * @returns {void}
 */
export function injectTailwind(): void {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('src/styles/tailwind.css');
    document.head.appendChild(link);
}
