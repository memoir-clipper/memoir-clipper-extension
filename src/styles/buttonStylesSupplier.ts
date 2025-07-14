import { colors } from './colors';
import { dimensions } from './dimensions';
import {
    CLASS_BUTTON_CONTAINER,
    CLASS_BUTTON_BASE,
    CLASS_BUTTON_PRIMARY,
    CLASS_BUTTON_SECONDARY,
    CLASS_BUTTON_CLICKED,
    CLASS_BUTTON_ICON,
    CLASS_BUTTON_LABEL,
} from '@/utils/values/ids';
import { BaseStylesSupplier } from './baseStylesSupplier';
import { Variant } from '@/utils/values/enums';

export class ButtonStylesSupplier extends BaseStylesSupplier {
    protected baseStyles = `
        ${this.classSelector(CLASS_BUTTON_CONTAINER)} {
            display: inline-block;
        }
        ${this.classSelector(CLASS_BUTTON_BASE)} {
            display: flex;
            align-items: center;
            gap: ${this.cssVar('--button-gap')};
            padding: ${this.cssVar('--button-padding')};
            border-radius: ${this.cssVar('--button-border-radius')};
            font: inherit;
            font-weight: ${this.cssVar('--button-font-weight')};
            cursor: pointer;
            transition: ${this.cssVar('--button-transition')};
            border: none;
            background: ${this.cssVar('--button-bg')};
            color: ${this.cssVar('--button-color')};
        }
        ${this.classSelector(CLASS_BUTTON_BASE)}:focus {
            outline: ${dimensions.focusOutlineWidth} solid ${this.cssVar('--button-focus-color')};
            outline-offset: ${dimensions.focusOutlineOffset};
        }
        ${this.classSelector(CLASS_BUTTON_BASE)}:hover {
            background: ${this.cssVar('--button-hover-bg')};
            transform: translateY(-1px);
            box-shadow: ${this.cssVar('--button-hover-shadow')};
        }
        ${this.classSelector(CLASS_BUTTON_BASE)}:active {
            transform: translateY(0);
        }
        ${this.classSelector(CLASS_BUTTON_CLICKED)} {
            transform: scale(0.95);
        }
        ${this.classSelector(CLASS_BUTTON_ICON)} {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        ${this.classSelector(CLASS_BUTTON_LABEL)} {
            display: inline-block;
        }
    `;

    protected cssVarMap: Record<Variant, Record<string, string>> = {
        [Variant.LIGHT]: {
            '--button-gap': dimensions.s,
            '--button-padding': `${dimensions.m} ${dimensions.xl}`,
            '--button-border-radius': dimensions.borderRadiusM,
            '--button-font-weight': dimensions.fontWeightMedium,
            '--button-transition': dimensions.transitionFast,
            '--button-bg': colors.gray50,
            '--button-color': colors.gray900,
            '--button-focus-color': colors.blue300,
            '--button-hover-bg': colors.gray100,
            '--button-hover-shadow': dimensions.shadowMedium,
            '--button-primary-bg': colors.blue500,
            '--button-primary-color': colors.white,
            '--button-primary-hover-bg': colors.blue600,
            '--button-primary-hover-shadow': `0 2px 8px ${colors.blue200}`,
        },
        [Variant.DARK]: {
            '--button-gap': dimensions.s,
            '--button-padding': `${dimensions.m} ${dimensions.xl}`,
            '--button-border-radius': dimensions.borderRadiusM,
            '--button-font-weight': dimensions.fontWeightMedium,
            '--button-transition': dimensions.transitionFast,
            '--button-bg': colors.gray700,
            '--button-color': colors.gray50,
            '--button-focus-color': colors.blue400,
            '--button-hover-bg': colors.gray600,
            '--button-hover-shadow': dimensions.shadowDark,
            '--button-primary-bg': colors.blue500,
            '--button-primary-color': colors.white,
            '--button-primary-hover-bg': colors.blue600,
            '--button-primary-hover-shadow': `0 2px 8px ${colors.blue800}`,
        },
    };

    protected stylesMap: Record<Variant, string> = {
        [Variant.LIGHT]: `
            ${this.classSelector(CLASS_BUTTON_PRIMARY)} {
                background: ${this.cssVar('--button-primary-bg')};
                color: ${this.cssVar('--button-primary-color')};
            }
            ${this.classSelector(CLASS_BUTTON_PRIMARY)}:hover {
                background: ${this.cssVar('--button-primary-hover-bg')};
                box-shadow: ${this.cssVar('--button-primary-hover-shadow')};
            }
            ${this.classSelector(CLASS_BUTTON_SECONDARY)} {
                background: ${colors.transparent};
                border: 1px solid ${colors.gray300};
            }
            ${this.classSelector(CLASS_BUTTON_SECONDARY)}:hover {
                border-color: ${colors.gray400};
            }
        `,
        [Variant.DARK]: `
            ${this.classSelector(CLASS_BUTTON_PRIMARY)} {
                background: ${this.cssVar('--button-primary-bg')};
                color: ${this.cssVar('--button-primary-color')};
            }
            ${this.classSelector(CLASS_BUTTON_PRIMARY)}:hover {
                background: ${this.cssVar('--button-primary-hover-bg')};
                box-shadow: ${this.cssVar('--button-primary-hover-shadow')};
            }
            ${this.classSelector(CLASS_BUTTON_SECONDARY)} {
                background: ${colors.transparent};
                border: 1px solid ${colors.gray600};
            }
            ${this.classSelector(CLASS_BUTTON_SECONDARY)}:hover {
                border-color: ${colors.gray500};
            }
        `,
    };

    public static getStyles(variant: Variant): string {
        return new this().getStyles(variant);
    }
}
