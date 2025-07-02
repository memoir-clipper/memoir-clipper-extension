import { DOM_UTILS } from '@/utils/helpers/domUtils';
import { TAGS } from '@/utils/values/htmlTags';
import { ATTRS } from '@/utils/values/htmlAttributes';
import { EVENTS } from '@/utils/values/enums';
import { BaseFactory, BaseInstance } from './baseFactory';
import {
    CLASS_BUTTON_CONTAINER,
    CLASS_BUTTON_BASE,
    CLASS_BUTTON_PRIMARY,
    CLASS_BUTTON_SECONDARY,
    CLASS_BUTTON_CLICKED,
    CLASS_BUTTON_ICON,
    CLASS_BUTTON_LABEL,
    ID_BUTTON_STYLES,
} from '@/utils/values/ids';
import { ButtonStyles } from '@/styles/buttonStyles';
import type { ButtonConfig, ButtonVariant } from './uiConfig';
import { logger } from '../helpers/logger';

// --- ButtonFactory ---

export class ButtonFactory extends BaseFactory {
    private static stylesMap: Record<ButtonVariant, string> = {
        default: ButtonStyles.defaultButtonStyle,
    };

    public static html = {
        icon: (icon: string) => `<span class="${CLASS_BUTTON_ICON}">${icon}</span>`,
        label: (label: string) => `<span class="${CLASS_BUTTON_LABEL}">${label}</span>`,
    };

    /**
     * Creates a new button instance and injects required styles.
     */
    public static create(config: ButtonConfig, variant: ButtonVariant = 'default'): ButtonInstance {
        const styles = ButtonFactory.getStylesForVariant(variant, this.stylesMap, ButtonStyles.defaultButtonStyle);
        this.ensureStyles(ID_BUTTON_STYLES, styles);
        return new ButtonInstance(config);
    }
}

// --- ButtonInstance ---

export class ButtonInstance extends BaseInstance {
    private button: HTMLElement;

    constructor(private config: ButtonConfig) {
        logger.debug('ButtonInstance: Constructor called', { config });

        super();
        this.container = this.createContainer();
        this.button = this.createButton();

        this.container.appendChild(this.button);
        this.setupEvents();

        logger.debug('ButtonInstance: Constructor completed', {
            containerClass: this.container.className,
            buttonClass: this.button.className,
        });
    }

    // --- Public API ---

    /** Returns the root element for this button. */
    public getElement(): HTMLElement {
        return this.container;
    }

    /** Programmatically triggers a click with animation and callback. */
    public click(): void {
        this.animateClick();
        this.config.onClick?.();
    }

    // --- DOM Creation ---

    private createContainer(): HTMLElement {
        const container = DOM_UTILS.createElement(TAGS.DIV, CLASS_BUTTON_CONTAINER);
        if (this.config.tooltip) {
            container.setAttribute(ATTRS.TOOLTIP, this.config.tooltip);
        }
        return container;
    }

    private createButton(): HTMLElement {
        const classes = [CLASS_BUTTON_BASE, this.config.primary ? CLASS_BUTTON_PRIMARY : CLASS_BUTTON_SECONDARY];
        const button = DOM_UTILS.createElement(TAGS.BUTTON, classes.join(' '));

        let content = '';
        if (this.config.icon) {
            content += ButtonFactory.html.icon(this.config.icon);
        }
        content += ButtonFactory.html.label(this.config.label);
        button.innerHTML = content;

        return button;
    }

    // --- UI Updates ---

    private animateClick(): void {
        this.button.classList.add(CLASS_BUTTON_CLICKED);
        setTimeout(() => {
            this.button.classList.remove(CLASS_BUTTON_CLICKED);
        }, 200);
    }

    // --- Event Handling ---

    private setupEvents(): void {
        this.eventManager.addEventHandler(this.button, EVENTS.CLICK, () => {
            this.click();
        });
    }
}
