import { KEYS, LogLevel } from '@/utils/values/enums';
import { Environment, getEnvironment } from '../helpers/environment';
import type { ShortcutConfig } from './types';
import type { DropdownOption } from '../ui/uiConfig';

export const TAG = 'Memoir';

/** Logging configuration using Vite environment variables. */
export const MINIMUM_LOG_LEVEL: LogLevel =
    getEnvironment() === Environment.PRODUCTION ? LogLevel.ERROR : LogLevel.DEBUG;

export const TRUE = 'true';
export const FALSE = 'false';
export const ZERO = '0';
export const MINUS_ONE = '-1';
export const SECONDS = 1000;

export const INLINE_TOOLBAR_SHORTCUT: ShortcutConfig = {
    key: KEYS.M,
    ctrlKey: true,
    shiftKey: true,
    altKey: false,
    metaKey: false,
};

export const ARROW_KEYS: Set<KEYS> = new Set([KEYS.ARROW_LEFT, KEYS.ARROW_RIGHT, KEYS.ARROW_UP, KEYS.ARROW_DOWN]);

export const TOOLBAR_DELAY_SHORTCUT = 250;

export const TOOLBAR_SPACES_DEFAULT_OPTIONS = [
    { id: 'personal', label: 'Personal' },
    { id: 'work', label: 'Work' },
    { id: 'research', label: 'Research' },
    { id: 'projects', label: 'Projects' },
];

export const TOOLBAR_TAGS_DEFAULT_OPTIONS = [
    { id: 'important', label: 'Important', additionalData: { color: '#ef4444' } },
    { id: 'idea', label: 'Idea', additionalData: { color: '#8b5cf6' } },
    { id: 'quote', label: 'Quote', additionalData: { color: '#06b6d4' } },
    { id: 'reference', label: 'Reference', additionalData: { color: '#10b981' } },
];

export const TOOLBAR_COLORS = [
    { id: 'blue', name: 'BLUE', value: '#3b82f6', shortcut: KEYS.B },
    { id: 'yellow', name: 'YELLOW', value: '#eab308', shortcut: KEYS.Y },
    { id: 'purple', name: 'PURPLE', value: '#8b5cf6', shortcut: KEYS.P },
    { id: 'orange', name: 'ORANGE', value: '#f97316', shortcut: KEYS.O },
    { id: 'green', name: 'GREEN', value: '#22c55e', shortcut: KEYS.G },
];

export const TOOLBAR_AI_ACTIONS_OPTIONS: DropdownOption[] = [
    { id: '', label: 'None' },
    { id: 'summarize', label: 'Summarize', description: 'Save the brief summary of the content' },
    { id: 'explain', label: 'Explain', description: 'Provide detailed explanation of the content' },
    { id: 'translate', label: 'Translate', description: 'Translate the content to another language' },
    { id: 'improve', label: 'Improve', description: 'Enhance grammar and style of the content' },
];
