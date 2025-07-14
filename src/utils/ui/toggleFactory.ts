import { DOM_UTILS } from '@/utils/helpers/domUtils';
import { TAGS } from '@/utils/values/htmlTags';
import { ATTRS } from '@/utils/values/htmlAttributes';
import { TRUE, FALSE } from '@/utils/values/constants';
import { EVENTS, KEYS, Variant } from '@/utils/values/enums';
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
import { ToggleStylesSupplier } from '@/styles/toggleStylesSupplier';
import type { ToggleConfig } from './uiConfig';

// --- ToggleFactory ---

export class ToggleFactory extends BaseFactory {
    // --- HTML Templates ---

    private static html = {
        label: (label: string) => `<span class="${CLASS_TOGGLE_LABEL}">${label}</span>`,
        track: () => `<span class="${CLASS_TOGGLE_TRACK}"><span class="${CLASS_TOGGLE_THUMB}"></span></span>`,
        shortcut: (shortcutKey: string, shortcutModifier?: string) => {
            const key = shortcutModifier ? `${shortcutModifier}+${shortcutKey}` : shortcutKey;
            return `<kbd class="${CLASS_TOGGLE_SHORTCUT}">${key}</kbd>`;
        },
    };

    // --- Factory Method ---

    /** Creates a new ToggleInstance and ensures styles are injected. */
    public static create(config: ToggleConfig, variant: Variant = Variant.LIGHT): ToggleInstance {
        this.ensureStyles(`${ID_TOGGLE_STYLES}-${variant}`, ToggleStylesSupplier.getStyles(variant));
        return new ToggleInstance(config);
    }

    // --- Expose HTML templates for ToggleInstance ---

    public static get htmlTemplates() {
        return this.html;
    }
}

// --- ToggleInstance ---

export class ToggleInstance extends BaseInstance {
    private button: HTMLElement;
    private isActive: boolean;
    private config: ToggleConfig;
    private html = ToggleFactory.htmlTemplates;

    constructor(config: ToggleConfig) {
        super();
        this.config = config;
        this.isActive = config.initialState ?? false;

        this.container = this.createContainer();
        this.button = this.createButton();

        this.container.appendChild(this.button);

        this.setupEvents();
        this.updateButton();
    }

    // --- Public API ---

    /** Returns the root element for this toggle instance. */
    override getElement(): HTMLElement | null {
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

    // --- DOM Creation & Updates ---

    /** Creates the container element for the toggle. */
    private createContainer(): HTMLElement {
        const container = DOM_UTILS.createElement(TAGS.DIV, CLASS_TOGGLE_CONTAINER);
        if (this.config.tooltip) {
            container.setAttribute(ATTRS.TOOLTIP, this.config.tooltip);
        }
        return container;
    }

    /** Creates the button element for the toggle. */
    private createButton(): HTMLElement {
        const button = DOM_UTILS.createElement(TAGS.BUTTON, CLASS_TOGGLE_BUTTON);
        button.setAttribute(ATTRS.ROLE, ATTRS.SWITCH);
        return button;
    }

    /** Updates the button's appearance and content based on state and config. */
    private updateButton(): void {
        if (this.isActive) {
            this.button.classList.add(CLASS_TOGGLE_ACTIVE);
        } else {
            this.button.classList.remove(CLASS_TOGGLE_ACTIVE);
        }

        this.button.setAttribute(ATTRS.ARIA_CHECKED, this.isActive ? TRUE : FALSE);

        let content = this.html.label(this.config.label);
        content += this.html.track();

        if (this.config.shortcutKey) {
            content += this.html.shortcut(this.config.shortcutKey, this.config.shortcutModifier);
        }

        this.button.innerHTML = content;
    }

    // --- Event Handling ---

    /** Sets up event handlers for the toggle button. */
    private setupEvents(): void {
        // Click handling
        this.eventManager.addEventHandler(this.button, EVENTS.CLICK, (_e: Event) => {
            this.toggle();
        });

        // Keyboard interaction - Enter only
        this.eventManager.addEventHandler(this.button, EVENTS.KEYDOWN, (e: Event) => {
            const keyEvent = e as KeyboardEvent;
            if (keyEvent.key === KEYS.ENTER) {
                e.preventDefault();
                this.toggle();
            }
        });

        // Handle mousedown for focus
        this.eventManager.addEventHandler(this.button, EVENTS.MOUSEDOWN, (_e: Event) => {
            requestAnimationFrame(() => {
                this.button.focus();
            });
        });
    }
}
