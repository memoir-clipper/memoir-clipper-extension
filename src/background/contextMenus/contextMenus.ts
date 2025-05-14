import { ID_IMAGE_CONTEXT_MENU, ID_LINK_CONTEXT_MENU, ID_PAGE_CONTEXT_MENU } from '@/utils/ids';
import { LABEL_IMAGE_CONTEXT_MENU, LABEL_LINK_CONTEXT_MENU, LABEL_PAGE_CONTEXT_MENU } from '@/utils/strings';

export const contextMenusList: chrome.contextMenus.CreateProperties[] = [
    {
        id: ID_IMAGE_CONTEXT_MENU,
        title: LABEL_IMAGE_CONTEXT_MENU,
        contexts: ['image' as chrome.contextMenus.ContextType],
        documentUrlPatterns: ['http://*/*', 'https://*/*'],
    },
    {
        id: ID_LINK_CONTEXT_MENU,
        title: LABEL_LINK_CONTEXT_MENU,
        contexts: ['link' as chrome.contextMenus.ContextType],
        documentUrlPatterns: ['http://*/*', 'https://*/*'],
    },
    {
        id: ID_PAGE_CONTEXT_MENU,
        title: LABEL_PAGE_CONTEXT_MENU,
        contexts: ['page' as chrome.contextMenus.ContextType],
        documentUrlPatterns: ['http://*/*', 'https://*/*'],
    },
];
