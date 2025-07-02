import { DOM_UTILS } from '@/utils/helpers/domUtils';
import { TAGS } from '@/utils/values/htmlTags';
import { ATTRS } from '@/utils/values/htmlAttributes';
import { EVENTS, TRUE, FALSE } from '@/utils/values/constants';
import { BaseFactory, BaseInstance } from './baseFactory';
import {
    CLASS_TOGGLE_CONTAINER,
    CLASS_TOGGLE_BUTTON,
    CLASS_TOGGLE_LABEL,
    CLASS_TOGGLE_TRACK,
    CLASS_TOGGLE_THUMB,
    CLASS_TOGGLE_ACTIVE,
    CLASS_TOGGLE_SHORTCUT,
    ID_TOGGLE_STYLES,
} from '@/utils/values/ids';
import { ToggleStyles } from '@/styles/toggleStyles';
import type { ToggleConfig, ToggleVariant } from './uiConfig';
import { logger } from '../helpers/logger';

// --- ToggleFactory ---

export class ToggleFactory extends BaseFactory {
    private static stylesMap: Record<ToggleVariant, string> = {
        default: ToggleStyles.defaultToggleStyle,
    };

    // --- HTML Templates ---

    public static html = {
        label: (label: string) => `<span class="${CLASS_TOGGLE_LABEL}">${label}</span>`,
        track: () => `<span class="${CLASS_TOGGLE_TRACK}"><span class="${CLASS_TOGGLE_THUMB}"></span></span>`,
        shortcut: (shortcutKey: string, shortcutModifier?: string) => {
            const key = shortcutModifier ? `${shortcutModifier}+${shortcutKey}` : shortcutKey;
            return `<kbd class="${CLASS_TOGGLE_SHORTCUT}">${key}</kbd>`;
        },
    };

    // --- Factory Method ---

    public static create(config: ToggleConfig, variant: ToggleVariant = 'default'): ToggleInstance {
        const styles = ToggleFactory.getStylesForVariant(variant, this.stylesMap, ToggleStyles.defaultToggleStyle);
        this.ensureStyles(ID_TOGGLE_STYLES, styles);
        return new ToggleInstance(config);
    }
}

// --- ToggleInstance ---

export class ToggleInstance extends BaseInstance {
    private button: HTMLElement;
    private isActive: boolean;
    private config: ToggleConfig;

    constructor(config: ToggleConfig) {
        logger.debug('ToggleInstance: Constructor called', { config });

        super();
        this.config = config;
        this.isActive = config.initialState ?? false;

        this.container = this.createContainer();
        this.button = this.createButton();

        this.container.appendChild(this.button);

        this.setupEvents();
        this.updateButton();

        logger.debug('ToggleInstance: Constructor completed', {
            containerClass: this.container.className,
            buttonClass: this.button.className,
        });
    }

    // --- Public API ---

    /** Returns the root element for this toggle instance. */
    public getElement(): HTMLElement {
        return this.container;
    }

    /** Returns the current state of the toggle. */
    public getState(): boolean {
        return this.isActive;
    }

    /** Sets the state of the toggle and updates the UI. */
    public setState(state: boolean): void {
        this.isActive = state;
        this.updateButton();
    }

    /** Toggles the state and triggers the onChange callback. */
    public toggle(): void {
        this.setState(!this.isActive);
        this.config.onChange?.(this.isActive);
    }

    // --- DOM Creation ---

    private createContainer(): HTMLElement {
        const container = DOM_UTILS.createElement(TAGS.DIV, CLASS_TOGGLE_CONTAINER);
        if (this.config.tooltip) {
            container.setAttribute(ATTRS.TOOLTIP, this.config.tooltip);
        }
        return container;
    }

    private createButton(): HTMLElement {
        const button = DOM_UTILS.createElement(TAGS.BUTTON, CLASS_TOGGLE_BUTTON);
        button.setAttribute(ATTRS.SWITCH, ATTRS.SWITCH);
        return button;
    }

    // --- UI Updates ---

    private updateButton(): void {
        if (this.isActive) {
            this.button.classList.add(CLASS_TOGGLE_ACTIVE);
        } else {
            this.button.classList.remove(CLASS_TOGGLE_ACTIVE);
        }

        this.button.setAttribute(ATTRS.ARIA_CHECKED, this.isActive ? TRUE : FALSE);

        let content = ToggleFactory.html.label(this.config.label);
        content += ToggleFactory.html.track();

        if (this.config.shortcutKey) {
            content += ToggleFactory.html.shortcut(this.config.shortcutKey, this.config.shortcutModifier);
        }

        this.button.innerHTML = content;
    }

    // --- Event Handling ---

    private setupEvents(): void {
        this.eventManager.addEventHandler(this.button, EVENTS.CLICK, () => {
            this.toggle();
        });
    }
}
