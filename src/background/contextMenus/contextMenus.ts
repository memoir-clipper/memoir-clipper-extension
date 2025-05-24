import { ID_IMAGE_CONTEXT_MENU, ID_LINK_CONTEXT_MENU, ID_PAGE_CONTEXT_MENU, ID_TEXT_CONTEXT_MENU } from '@/utils/ids';
import { LABEL_IMAGE_CONTEXT_MENU, LABEL_LINK_CONTEXT_MENU, LABEL_PAGE_CONTEXT_MENU, LABEL_TEXT_CONTEXT_MENU } from '@/utils/strings';

const allDocumentUrlPatterns = ['http://*/*', 'https://*/*'];

export const contextMenusList: chrome.contextMenus.CreateProperties[] = [
    {
        id: ID_IMAGE_CONTEXT_MENU,
        title: LABEL_IMAGE_CONTEXT_MENU,
        contexts: ['image' as chrome.contextMenus.ContextType],
        documentUrlPatterns: allDocumentUrlPatterns,
    },
    {
        id: ID_LINK_CONTEXT_MENU,
        title: LABEL_LINK_CONTEXT_MENU,
        contexts: ['link' as chrome.contextMenus.ContextType],
        documentUrlPatterns: allDocumentUrlPatterns,
    },
    {
        id: ID_PAGE_CONTEXT_MENU,
        title: LABEL_PAGE_CONTEXT_MENU,
        contexts: ['page' as chrome.contextMenus.ContextType],
        documentUrlPatterns: allDocumentUrlPatterns,
    },
    {
        id: ID_TEXT_CONTEXT_MENU,
        title: LABEL_TEXT_CONTEXT_MENU,
        contexts: ['selection' as chrome.contextMenus.ContextType],
        documentUrlPatterns: allDocumentUrlPatterns,
    },
];
