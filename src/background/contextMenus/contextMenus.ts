import { ID_IMAGE_CONTEXT_MENU } from '@/utils/ids';
import { LABEL_IMAGE_CONTEXT_MENU } from '@/utils/strings';

export const contextMenusList: chrome.contextMenus.CreateProperties[] = [
    {
        id: ID_IMAGE_CONTEXT_MENU,
        title: LABEL_IMAGE_CONTEXT_MENU,
        contexts: ['image' as chrome.contextMenus.ContextType],
    },
];
