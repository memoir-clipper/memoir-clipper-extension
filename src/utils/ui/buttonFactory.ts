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

// --- ButtonFactory ---

export class ButtonFactory extends BaseFactory {
    private static stylesMap: Record<ButtonVariant, string> = {
        default: ButtonStyles.defaultButtonStyle,
    };

    public static html = {
        icon: (icon: string) => `<span class="${CLASS_BUTTON_ICON}">${icon}</span>`,
        label: (label: string) => `<span class="${CLASS_BUTTON_LABEL}">${label}</span>`,
    };

    /** Creates a new button instance and injects required styles. */
    public static create(config: ButtonConfig, variant: ButtonVariant = 'default'): ButtonInstance {
        const styles = ButtonFactory.getStylesForVariant(variant, this.stylesMap, ButtonStyles.defaultButtonStyle);
        this.ensureStyles(ID_BUTTON_STYLES, styles);
        return new ButtonInstance(config);
    }
}

// --- ButtonInstance ---

export class ButtonInstance extends BaseInstance {
    private button: HTMLElement;
    protected container: HTMLElement;

    constructor(private config: ButtonConfig) {
        super();
        this.container = this.createContainer();
        this.button = this.createButton();
        this.container.appendChild(this.button);
        this.setupEvents();
    }

    // --- Public API ---

    /** Returns the root element for this button. */
    override getElement(): HTMLElement | null {
        return this.container;
    }

    /** Programmatically triggers a click with animation and callback. */
    public click(): void {
        this.animateClick();
        this.config.onClick?.();
    }

    // --- DOM Creation & UI Updates ---

    /** Creates the container element and sets tooltip if provided. */
    private createContainer(): HTMLElement {
        const container = DOM_UTILS.createElement(TAGS.DIV, CLASS_BUTTON_CONTAINER);
        if (this.config.tooltip) {
            container.setAttribute(ATTRS.TOOLTIP, this.config.tooltip);
        }
        return container;
    }

    /** Creates the button element with icon and label. */
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

    /** Animates the button click by toggling a CSS class. */
    private animateClick(): void {
        this.button.classList.add(CLASS_BUTTON_CLICKED);
        setTimeout(() => {
            this.button.classList.remove(CLASS_BUTTON_CLICKED);
        }, 200);
    }

    // --- Event Handling ---

    /** Sets up the click event handler for the button. */
    private setupEvents(): void {
        this.eventManager.addEventHandler(this.button, EVENTS.CLICK, () => {
            this.click();
        });
    }
}
