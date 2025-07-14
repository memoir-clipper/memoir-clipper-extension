import { colors } from './colors';
import { dimensions } from './dimensions';
import {
    CLASS_TOGGLE_CONTAINER,
    CLASS_TOGGLE_BUTTON,
    CLASS_TOGGLE_LABEL,
    CLASS_TOGGLE_TRACK,
    CLASS_TOGGLE_THUMB,
    CLASS_TOGGLE_ACTIVE,
    CLASS_TOGGLE_SHORTCUT,
} from '@/utils/values/ids';
import { BaseStylesSupplier } from './baseStylesSupplier';
import { Variant } from '@/utils/values/enums';

export class ToggleStylesSupplier extends BaseStylesSupplier {
    protected baseStyles = `
        ${this.classSelector(CLASS_TOGGLE_CONTAINER)} {
            display: inline-block;
        }
        ${this.classSelector(CLASS_TOGGLE_BUTTON)} {
            display: flex;
            align-items: center;
            gap: ${this.cssVar('--toggle-gap')};
            padding: ${this.cssVar('--toggle-padding')};
            border: 1px solid ${this.cssVar('--toggle-border-color')};
            border-radius: ${this.cssVar('--toggle-border-radius')};
            cursor: pointer;
            font: inherit;
            background: ${this.cssVar('--toggle-bg')};
            color: ${this.cssVar('--toggle-color')};
            transition: ${this.cssVar('--toggle-transition')};
        }
        ${this.classSelector(CLASS_TOGGLE_BUTTON)}:focus {
            outline: ${dimensions.focusOutlineWidth} solid ${this.cssVar('--toggle-focus-color')};
            outline-offset: ${dimensions.focusOutlineOffset};
        }
        ${this.classSelector(CLASS_TOGGLE_BUTTON)}:hover {
            background: ${this.cssVar('--toggle-hover-bg')};
            border-color: ${this.cssVar('--toggle-hover-border-color')};
        }
        ${this.classSelector(CLASS_TOGGLE_LABEL)} {
            font-size: ${this.cssVar('--toggle-label-size')};
            white-space: nowrap;
        }
        ${this.classSelector(CLASS_TOGGLE_TRACK)} {
            position: relative;
            width: ${this.cssVar('--toggle-track-width')};
            height: ${this.cssVar('--toggle-track-height')};
            border-radius: ${this.cssVar('--toggle-track-border-radius')};
            background: ${this.cssVar('--toggle-track-bg')};
            transition: ${this.cssVar('--toggle-track-transition')};
        }
        ${this.classSelector(CLASS_TOGGLE_THUMB)} {
            position: absolute;
            left: ${dimensions.xs};
            top: ${dimensions.xs};
            width: ${this.cssVar('--toggle-thumb-size')};
            height: ${this.cssVar('--toggle-thumb-size')};
            border-radius: ${dimensions.borderRadiusRound};
            background: ${this.cssVar('--toggle-thumb-bg')};
            box-shadow: ${this.cssVar('--toggle-thumb-shadow')};
            transition: ${this.cssVar('--toggle-thumb-transition')};
        }
        ${this.classSelector(CLASS_TOGGLE_ACTIVE)} .${CLASS_TOGGLE_TRACK} {
            background: ${this.cssVar('--toggle-track-active-bg')};
        }
        ${this.classSelector(CLASS_TOGGLE_ACTIVE)} .${CLASS_TOGGLE_THUMB} {
            transform: translateX(${this.cssVar('--toggle-thumb-translate')});
        }
        ${this.classSelector(CLASS_TOGGLE_SHORTCUT)} {
            padding: ${this.cssVar('--toggle-shortcut-padding')};
            border-radius: ${this.cssVar('--toggle-shortcut-border-radius')};
            font-size: ${this.cssVar('--toggle-shortcut-size')};
            font-family: ${this.cssVar('--toggle-shortcut-font')};
            background: ${this.cssVar('--toggle-shortcut-bg')};
            color: ${this.cssVar('--toggle-shortcut-color')};
            border: 1px solid ${this.cssVar('--toggle-shortcut-border-color')};
        }
    `;

    protected cssVarMap: Record<Variant, Record<string, string>> = {
        [Variant.LIGHT]: {
            '--toggle-gap': dimensions.s,
            '--toggle-padding': `${dimensions.m} ${dimensions.l}`,
            '--toggle-border-color': colors.gray300,
            '--toggle-border-radius': dimensions.borderRadiusM,
            '--toggle-bg': colors.white,
            '--toggle-color': colors.gray700,
            '--toggle-transition': dimensions.transitionFast,
            '--toggle-focus-color': colors.blue300,
            '--toggle-hover-bg': colors.gray50,
            '--toggle-hover-border-color': colors.gray400,
            '--toggle-label-size': dimensions.fontSizeM,
            '--toggle-track-width': dimensions.toggleTrackWidth,
            '--toggle-track-height': dimensions.toggleTrackHeight,
            '--toggle-track-border-radius': dimensions.borderRadiusToggle,
            '--toggle-track-bg': colors.gray200,
            '--toggle-track-transition': `background ${dimensions.transitionMedium}`,
            '--toggle-track-active-bg': colors.blue500,
            '--toggle-thumb-size': dimensions.toggleThumbSize,
            '--toggle-thumb-bg': colors.white,
            '--toggle-thumb-shadow': dimensions.shadowLight,
            '--toggle-thumb-transition': `transform ${dimensions.transitionMedium}`,
            '--toggle-thumb-translate': dimensions.xl,
            '--toggle-shortcut-padding': `${dimensions.xs} 5px`,
            '--toggle-shortcut-border-radius': dimensions.borderRadiusS,
            '--toggle-shortcut-size': dimensions.fontSizeS,
            '--toggle-shortcut-font': "'SFMono-Regular', Consolas, monospace",
            '--toggle-shortcut-bg': colors.gray100,
            '--toggle-shortcut-color': colors.gray700,
            '--toggle-shortcut-border-color': colors.gray300,
        },
        [Variant.DARK]: {
            '--toggle-gap': dimensions.s,
            '--toggle-padding': `${dimensions.m} ${dimensions.l}`,
            '--toggle-border-color': colors.gray600,
            '--toggle-border-radius': dimensions.borderRadiusM,
            '--toggle-bg': colors.gray700,
            '--toggle-color': colors.gray50,
            '--toggle-transition': dimensions.transitionFast,
            '--toggle-focus-color': colors.blue400,
            '--toggle-hover-bg': colors.gray600,
            '--toggle-hover-border-color': colors.gray500,
            '--toggle-label-size': dimensions.fontSizeM,
            '--toggle-track-width': dimensions.toggleTrackWidth,
            '--toggle-track-height': dimensions.toggleTrackHeight,
            '--toggle-track-border-radius': dimensions.borderRadiusToggle,
            '--toggle-track-bg': colors.gray500,
            '--toggle-track-transition': `background ${dimensions.transitionMedium}`,
            '--toggle-track-active-bg': colors.blue500,
            '--toggle-thumb-size': dimensions.toggleThumbSize,
            '--toggle-thumb-bg': colors.white,
            '--toggle-thumb-shadow': `0 1px 2px ${colors.black}30`,
            '--toggle-thumb-transition': `transform ${dimensions.transitionMedium}`,
            '--toggle-thumb-translate': dimensions.xl,
            '--toggle-shortcut-padding': `${dimensions.xs} 5px`,
            '--toggle-shortcut-border-radius': dimensions.borderRadiusS,
            '--toggle-shortcut-size': dimensions.fontSizeS,
            '--toggle-shortcut-font': "'SFMono-Regular', Consolas, monospace",
            '--toggle-shortcut-bg': colors.gray600,
            '--toggle-shortcut-color': colors.gray50,
            '--toggle-shortcut-border-color': colors.gray500,
        },
    };

    protected stylesMap: Record<Variant, string> = {
        [Variant.LIGHT]: `
            /* Light theme specific overrides */
        `,
        [Variant.DARK]: `
            /* Dark theme specific overrides */
        `,
    };

    public static getStyles(variant: Variant): string {
        return new this().getStyles(variant);
    }
}
