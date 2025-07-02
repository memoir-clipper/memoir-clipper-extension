import { CONTEXTS } from '@/utils/values/enums';
import {
    ID_IMAGE_CONTEXT_MENU,
    ID_LINK_CONTEXT_MENU,
    ID_PAGE_CONTEXT_MENU,
    ID_TEXT_CONTEXT_MENU,
} from '@/utils/values/ids';
import {
    LABEL_IMAGE_CONTEXT_MENU,
    LABEL_LINK_CONTEXT_MENU,
    LABEL_PAGE_CONTEXT_MENU,
    LABEL_TEXT_CONTEXT_MENU,
} from '@/utils/values/strings';

/**
 * URL patterns for which context menus are available.
 * @constant
 */
const ALL_DOCUMENT_URL_PATTERNS = ['http://*/*', 'https://*/*'];

/**
 * Properties for a single context menu item.
 */
interface ContextMenuConfig extends chrome.contextMenus.CreateProperties {}

/**
 * Provides context menu configurations for the extension.
 * Encapsulates all menu definitions and exposes them for registration.
 */
export class ContextMenuProvider {
    /**
     * Returns the list of context menu configurations.
     */
    public static getContextMenus(): ContextMenuConfig[] {
        return [
            {
                id: ID_IMAGE_CONTEXT_MENU,
                title: LABEL_IMAGE_CONTEXT_MENU,
                contexts: [CONTEXTS.IMAGE],
                documentUrlPatterns: ALL_DOCUMENT_URL_PATTERNS,
            },
            {
                id: ID_LINK_CONTEXT_MENU,
                title: LABEL_LINK_CONTEXT_MENU,
                contexts: [CONTEXTS.LINK],
                documentUrlPatterns: ALL_DOCUMENT_URL_PATTERNS,
            },
            {
                id: ID_PAGE_CONTEXT_MENU,
                title: LABEL_PAGE_CONTEXT_MENU,
                contexts: [CONTEXTS.PAGE],
                documentUrlPatterns: ALL_DOCUMENT_URL_PATTERNS,
            },
            {
                id: ID_TEXT_CONTEXT_MENU,
                title: LABEL_TEXT_CONTEXT_MENU,
                contexts: [CONTEXTS.SELECTION],
                documentUrlPatterns: ALL_DOCUMENT_URL_PATTERNS,
            },
        ];
    }
}

/**
 * List of context menu configurations for direct usage.
 * Maintained for backward compatibility.
 */
export const contextMenusList: ContextMenuConfig[] = ContextMenuProvider.getContextMenus();
