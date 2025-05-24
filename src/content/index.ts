import { logger } from '@/utils/logger';
import { detectTextSelection } from './textSelectionDetector';
import { TextModel } from '@/models/textModel';
import { TEXT_SELECTED_ACTION } from '@/utils/actions';

logger.info('Content script loaded');

let textSelection: TextModel | null = null;

detectTextSelection((textModel, _position, _selectionRect) => {
    logger.info('Text selection detected:', textModel.text);
    textSelection = textModel;
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === TEXT_SELECTED_ACTION) {
        if (textSelection) {
            sendResponse({ success: true, model: textSelection });
            logger.debug('Sending text selection:', textSelection.text);
        } else {
            sendResponse({ success: false });
            logger.warn('No text selection available to send');
        }
        return true;
    }
    return false;
});
