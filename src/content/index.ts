import { logger } from '@/utils/logger';
import { TextSelectionOrchestrator } from './managers/textSelectionOrchestrator';
import { injectTailwind } from '@/styles/tailwindInjector';

logger.info('Content script loaded');

injectTailwind();
TextSelectionOrchestrator.init();
