// This file contains constants that are used throughout the app

import { LogLevel } from './enums';

export const TAG = 'Memoir';

// Using environment variables from Vite
export const LOG_ENABLED = import.meta.env.VITE_LOG_ENABLED === 'true';
export const MINIMUM_LOG_LEVEL = (import.meta.env.VITE_MINIMUM_LOG_LEVEL as LogLevel) || LogLevel.ERROR;

export const EVENTS = {
    KEYDOWN: 'keydown',
    MOUSEDOWN: 'mousedown',
    SCROLL: 'scroll',
    RESIZE: 'resize',
};

export const MENU_CONFIG = {
    ANIMATION: {
        DURATION_MS: 200,
        EASING: 'ease',
    },
    POSITION: {
        DEFAULT_OFFSET: 10,
        MIN_VIEWPORT_MARGIN: 10,
        OFFSET_Y: 5,
    },
    VISIBILITY: {
        AUTO_HIDE_DELAY_MS: 10000,
        ENABLE_AUTO_HIDE: true,
        ENABLE_ESCAPE_KEY: true,
        ENABLE_CLICK_OUTSIDE: true,
        ENABLE_SCROLL_HIDE: true,
        ENABLE_RESIZE_HIDE: true,
    },
} as const;

export const MENU_EVENTS = {
    KEYDOWN: 'keydown',
    MOUSEDOWN: 'mousedown',
    SCROLL: 'scroll',
    RESIZE: 'resize',
} as const;
