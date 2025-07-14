import { colors } from './colors';
import { dimensions } from './dimensions';
import {
    CLASS_DROPDOWN_ARROW,
    CLASS_DROPDOWN_BUTTON,
    CLASS_DROPDOWN_CHECKBOX,
    CLASS_DROPDOWN_COLOR_INDICATOR,
    CLASS_DROPDOWN_CONTAINER,
    CLASS_DROPDOWN_EMPTY,
    CLASS_DROPDOWN_LABEL,
    CLASS_DROPDOWN_MENU,
    CLASS_DROPDOWN_OPEN,
    CLASS_DROPDOWN_OPTION,
    CLASS_DROPDOWN_OPTION_CONTENT,
    CLASS_DROPDOWN_OPTION_DESCRIPTION,
    CLASS_DROPDOWN_OPTION_FLEX,
    CLASS_DROPDOWN_OPTION_FOCUSED,
    CLASS_DROPDOWN_OPTION_LABEL,
    CLASS_DROPDOWN_OPTION_SELECTED,
    CLASS_DROPDOWN_SEARCH,
    CLASS_DROPDOWN_SEARCH_INPUT,
    CLASS_DROPDOWN_SELECTION,
} from '@/utils/values/ids';
import { BaseStylesSupplier } from './baseStylesSupplier';
import { Variant } from '@/utils/values/enums';

export class DropdownStylesSupplier extends BaseStylesSupplier {
    protected baseStyles = `
        ${this.classSelector(CLASS_DROPDOWN_CONTAINER)} {
            position: relative;
            display: inline-block;
        }
        ${this.classSelector(CLASS_DROPDOWN_BUTTON)} {
            display: flex;
            align-items: center;
            gap: ${this.cssVar('--dropdown-gap')};
            border: 1px solid ${this.cssVar('--dropdown-border-color')};
            border-radius: ${this.cssVar('--dropdown-border-radius')};
            padding: ${this.cssVar('--dropdown-padding')};
            cursor: pointer;
            transition: ${this.cssVar('--dropdown-transition')};
            font: inherit;
            min-width: ${this.cssVar('--dropdown-min-width')};
            background: ${this.cssVar('--dropdown-bg')};
            color: ${this.cssVar('--dropdown-color')};
        }
        ${this.classSelector(CLASS_DROPDOWN_BUTTON)}:focus {
            outline: ${dimensions.focusOutlineWidth} solid ${this.cssVar('--dropdown-focus-color')};
            outline-offset: ${dimensions.focusOutlineOffset};
        }
        ${this.classSelector(CLASS_DROPDOWN_BUTTON)}--open {
            border-color: ${this.cssVar('--dropdown-open-border-color')};
        }
        ${this.classSelector(CLASS_DROPDOWN_LABEL)} {
            color: ${this.cssVar('--dropdown-label-color')};
            font-size: ${this.cssVar('--dropdown-label-size')};
            font-weight: ${this.cssVar('--dropdown-label-weight')};
            text-transform: uppercase;
            letter-spacing: ${this.cssVar('--dropdown-label-spacing')};
            margin-right: ${this.cssVar('--dropdown-label-margin')};
        }
        ${this.classSelector(CLASS_DROPDOWN_SELECTION)} {
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        ${this.classSelector(CLASS_DROPDOWN_ARROW)} {
            font-size: ${this.cssVar('--dropdown-arrow-size')};
            color: ${this.cssVar('--dropdown-arrow-color')};
            transition: ${this.cssVar('--dropdown-arrow-transition')};
        }
        ${this.classSelector(CLASS_DROPDOWN_OPEN)} .${CLASS_DROPDOWN_ARROW} {
            transform: rotate(180deg);
        }
        ${this.classSelector(CLASS_DROPDOWN_MENU)} {
            position: absolute;
            top: 100%;
            left: 0;
            margin-top: ${this.cssVar('--dropdown-menu-margin')};
            min-width: 100%;
            max-height: 0;
            overflow: hidden;
            border-radius: ${this.cssVar('--dropdown-menu-border-radius')};
            box-shadow: ${this.cssVar('--dropdown-menu-shadow')};
            opacity: 0;
            transform: translateY(-${dimensions.m});
            transition: ${this.cssVar('--dropdown-menu-transition')};
            pointer-events: none;
            z-index: 1000;
            border: 1px solid ${this.cssVar('--dropdown-menu-border-color')};
            background: ${this.cssVar('--dropdown-menu-bg')};
        }
        ${this.classSelector(CLASS_DROPDOWN_OPEN)} .${CLASS_DROPDOWN_MENU} {
            max-height: ${this.cssVar('--dropdown-menu-max-height')};
            overflow-y: auto;
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto;
        }
        ${this.classSelector(CLASS_DROPDOWN_SEARCH)} {
            padding: ${this.cssVar('--dropdown-search-padding')};
            border-bottom: 1px solid ${this.cssVar('--dropdown-search-border-color')};
        }
        ${this.classSelector(CLASS_DROPDOWN_SEARCH_INPUT)} {
            width: 100%;
            padding: ${this.cssVar('--dropdown-search-input-padding')};
            border: 1px solid ${this.cssVar('--dropdown-search-input-border-color')};
            border-radius: ${this.cssVar('--dropdown-search-input-border-radius')};
            font: inherit;
            font-size: ${this.cssVar('--dropdown-search-input-size')};
            background: ${this.cssVar('--dropdown-search-input-bg')};
            color: ${this.cssVar('--dropdown-search-input-color')};
        }
        ${this.classSelector(CLASS_DROPDOWN_SEARCH_INPUT)}:focus {
            outline: none;
            border-color: ${this.cssVar('--dropdown-search-input-focus-border')};
            box-shadow: ${this.cssVar('--dropdown-search-input-focus-shadow')};
        }
        ${this.classSelector(CLASS_DROPDOWN_OPTION)} {
            padding: ${this.cssVar('--dropdown-option-padding')};
            cursor: pointer;
            transition: ${this.cssVar('--dropdown-option-transition')};
            display: flex;
            align-items: center;
            gap: ${this.cssVar('--dropdown-option-gap')};
            color: ${this.cssVar('--dropdown-option-color')};
        }
        ${this.classSelector(CLASS_DROPDOWN_OPTION)}:hover {
            background: ${this.cssVar('--dropdown-option-hover-bg')};
        }
        ${this.classSelector(CLASS_DROPDOWN_CHECKBOX)} {
            width: ${this.cssVar('--dropdown-checkbox-size')};
            height: ${this.cssVar('--dropdown-checkbox-size')};
            border: 1px solid ${this.cssVar('--dropdown-checkbox-border-color')};
            border-radius: ${this.cssVar('--dropdown-checkbox-border-radius')};
            position: relative;
            flex-shrink: 0;
            background: ${this.cssVar('--dropdown-checkbox-bg')};
        }
        ${this.classSelector(CLASS_DROPDOWN_OPTION_SELECTED)} .${CLASS_DROPDOWN_CHECKBOX} {
            background: ${this.cssVar('--dropdown-checkbox-selected-bg')};
            border-color: ${this.cssVar('--dropdown-checkbox-selected-border')};
        }
        ${this.classSelector(CLASS_DROPDOWN_OPTION_SELECTED)} .${CLASS_DROPDOWN_CHECKBOX}::after {
            content: "";
            position: absolute;
            top: ${dimensions.xs};
            left: 5px;
            width: ${dimensions.xs};
            height: ${dimensions.m};
            border-right: ${dimensions.xs} solid ${this.cssVar('--dropdown-checkbox-check-color')};
            border-bottom: ${dimensions.xs} solid ${this.cssVar('--dropdown-checkbox-check-color')};
            transform: rotate(45deg);
        }
        ${this.classSelector(CLASS_DROPDOWN_OPTION_CONTENT)} {
            flex: 1;
            min-width: 0;
        }
        ${this.classSelector(CLASS_DROPDOWN_OPTION_LABEL)} {
            font-weight: ${this.cssVar('--dropdown-option-label-weight')};
            flex: 1;
        }
        ${this.classSelector(CLASS_DROPDOWN_OPTION_DESCRIPTION)} {
            font-size: ${this.cssVar('--dropdown-option-description-size')};
            color: ${this.cssVar('--dropdown-option-description-color')};
            margin-top: ${this.cssVar('--dropdown-option-description-margin')};
        }
        ${this.classSelector(CLASS_DROPDOWN_EMPTY)} {
            padding: ${this.cssVar('--dropdown-empty-padding')};
            text-align: center;
            color: ${this.cssVar('--dropdown-empty-color')};
            font-style: italic;
        }
        ${this.classSelector(CLASS_DROPDOWN_SELECTION)}--tags-selected {
            color: ${this.cssVar('--dropdown-selection-tags-color')};
            font-weight: ${this.cssVar('--dropdown-selection-tags-weight')};
        }
        ${this.classSelector(CLASS_DROPDOWN_OPTION_FOCUSED)} {
            background-color: ${this.cssVar('--dropdown-option-focused-bg')};
            outline: ${dimensions.focusOutlineWidth} solid ${this.cssVar('--dropdown-option-focused-outline')};
        }
        ${this.classSelector(CLASS_DROPDOWN_COLOR_INDICATOR)} {
            display: inline-block;
            width: ${this.cssVar('--dropdown-color-indicator-size')};
            height: ${this.cssVar('--dropdown-color-indicator-size')};
            border-radius: ${dimensions.borderRadiusRound};
            margin-right: ${this.cssVar('--dropdown-color-indicator-margin')};
            flex-shrink: 0;
        }
        ${this.classSelector(CLASS_DROPDOWN_COLOR_INDICATOR)}--large {
            width: ${this.cssVar('--dropdown-color-indicator-large-size')};
            height: ${this.cssVar('--dropdown-color-indicator-large-size')};
            border: 1px solid ${this.cssVar('--dropdown-color-indicator-border-color')};
            margin-right: ${this.cssVar('--dropdown-color-indicator-large-margin')};
        }
        ${this.classSelector(CLASS_DROPDOWN_OPTION_FLEX)} {
            display: flex;
            align-items: center;
            width: 100%;
            flex: 1;
        }
    `;

    protected cssVarMap: Record<Variant, Record<string, string>> = {
        [Variant.LIGHT]: {
            '--dropdown-gap': dimensions.s,
            '--dropdown-border-color': colors.gray300,
            '--dropdown-border-radius': dimensions.borderRadiusM,
            '--dropdown-padding': `${dimensions.m} ${dimensions.l}`,
            '--dropdown-transition': dimensions.transitionFast,
            '--dropdown-min-width': dimensions.dropdownMinWidth,
            '--dropdown-bg': colors.white,
            '--dropdown-color': colors.gray700,
            '--dropdown-focus-color': colors.blue300,
            '--dropdown-open-border-color': colors.blue500,
            '--dropdown-label-color': colors.gray500,
            '--dropdown-label-size': dimensions.fontSizeS,
            '--dropdown-label-weight': dimensions.fontWeightSemibold,
            '--dropdown-label-spacing': dimensions.letterSpacingTight,
            '--dropdown-label-margin': dimensions.s,
            '--dropdown-arrow-size': dimensions.fontSizeXs,
            '--dropdown-arrow-color': colors.gray500,
            '--dropdown-arrow-transition': `transform ${dimensions.transitionFast}`,
            '--dropdown-menu-margin': dimensions.s,
            '--dropdown-menu-border-radius': dimensions.borderRadiusM,
            '--dropdown-menu-shadow': dimensions.shadowHeavy,
            '--dropdown-menu-transition': dimensions.transitionMedium,
            '--dropdown-menu-border-color': colors.gray200,
            '--dropdown-menu-bg': colors.white,
            '--dropdown-menu-max-height': dimensions.dropdownMaxHeight,
            '--dropdown-search-padding': dimensions.m,
            '--dropdown-search-border-color': colors.gray100,
            '--dropdown-search-input-padding': `${dimensions.s} ${dimensions.m}`,
            '--dropdown-search-input-border-color': colors.gray300,
            '--dropdown-search-input-border-radius': dimensions.borderRadiusS,
            '--dropdown-search-input-size': dimensions.fontSizeM,
            '--dropdown-search-input-bg': colors.white,
            '--dropdown-search-input-color': colors.gray700,
            '--dropdown-search-input-focus-border': colors.blue500,
            '--dropdown-search-input-focus-shadow': `0 0 0 ${dimensions.xs} ${colors.blue200}`,
            '--dropdown-option-padding': `${dimensions.m} ${dimensions.l}`,
            '--dropdown-option-transition': `background ${dimensions.transitionFast}`,
            '--dropdown-option-gap': dimensions.l,
            '--dropdown-option-color': colors.gray700,
            '--dropdown-option-hover-bg': colors.gray50,
            '--dropdown-checkbox-size': dimensions.xl,
            '--dropdown-checkbox-border-color': colors.gray300,
            '--dropdown-checkbox-border-radius': dimensions.borderRadiusS,
            '--dropdown-checkbox-bg': colors.white,
            '--dropdown-checkbox-selected-bg': colors.blue500,
            '--dropdown-checkbox-selected-border': colors.blue500,
            '--dropdown-checkbox-check-color': colors.white,
            '--dropdown-option-label-weight': dimensions.fontWeightMedium,
            '--dropdown-option-description-size': dimensions.fontSizeS,
            '--dropdown-option-description-color': colors.gray500,
            '--dropdown-option-description-margin': dimensions.xs,
            '--dropdown-empty-padding': dimensions.xl,
            '--dropdown-empty-color': colors.gray500,
            '--dropdown-selection-tags-color': colors.blue500,
            '--dropdown-selection-tags-weight': dimensions.fontWeightMedium,
            '--dropdown-option-focused-bg': colors.blue100,
            '--dropdown-option-focused-outline': colors.blue700,
            '--dropdown-color-indicator-size': dimensions.l,
            '--dropdown-color-indicator-margin': dimensions.l,
            '--dropdown-color-indicator-large-size': dimensions.xl,
            '--dropdown-color-indicator-border-color': `${colors.black}1A`,
            '--dropdown-color-indicator-large-margin': dimensions.m,
        },
        [Variant.DARK]: {
            '--dropdown-gap': dimensions.s,
            '--dropdown-border-color': colors.gray600,
            '--dropdown-border-radius': dimensions.borderRadiusM,
            '--dropdown-padding': `${dimensions.m} ${dimensions.l}`,
            '--dropdown-transition': dimensions.transitionFast,
            '--dropdown-min-width': dimensions.dropdownMinWidth,
            '--dropdown-bg': colors.gray700,
            '--dropdown-color': colors.gray50,
            '--dropdown-focus-color': colors.blue400,
            '--dropdown-open-border-color': colors.blue500,
            '--dropdown-label-color': colors.gray400,
            '--dropdown-label-size': dimensions.fontSizeS,
            '--dropdown-label-weight': dimensions.fontWeightSemibold,
            '--dropdown-label-spacing': dimensions.letterSpacingTight,
            '--dropdown-label-margin': dimensions.s,
            '--dropdown-arrow-size': dimensions.fontSizeXs,
            '--dropdown-arrow-color': colors.gray400,
            '--dropdown-arrow-transition': `transform ${dimensions.transitionFast}`,
            '--dropdown-menu-margin': dimensions.s,
            '--dropdown-menu-border-radius': dimensions.borderRadiusM,
            '--dropdown-menu-shadow': dimensions.shadowDark,
            '--dropdown-menu-transition': dimensions.transitionMedium,
            '--dropdown-menu-border-color': colors.gray600,
            '--dropdown-menu-bg': colors.gray700,
            '--dropdown-menu-max-height': dimensions.dropdownMaxHeight,
            '--dropdown-search-padding': dimensions.m,
            '--dropdown-search-border-color': colors.gray600,
            '--dropdown-search-input-padding': `${dimensions.s} ${dimensions.m}`,
            '--dropdown-search-input-border-color': colors.gray600,
            '--dropdown-search-input-border-radius': dimensions.borderRadiusS,
            '--dropdown-search-input-size': dimensions.fontSizeM,
            '--dropdown-search-input-bg': colors.gray700,
            '--dropdown-search-input-color': colors.gray50,
            '--dropdown-search-input-focus-border': colors.blue500,
            '--dropdown-search-input-focus-shadow': `0 0 0 ${dimensions.xs} ${colors.blue800}`,
            '--dropdown-option-padding': `${dimensions.m} ${dimensions.l}`,
            '--dropdown-option-transition': `background ${dimensions.transitionFast}`,
            '--dropdown-option-gap': dimensions.l,
            '--dropdown-option-color': colors.gray50,
            '--dropdown-option-hover-bg': colors.gray600,
            '--dropdown-checkbox-size': dimensions.xl,
            '--dropdown-checkbox-border-color': colors.gray500,
            '--dropdown-checkbox-border-radius': dimensions.borderRadiusS,
            '--dropdown-checkbox-bg': colors.gray700,
            '--dropdown-checkbox-selected-bg': colors.blue500,
            '--dropdown-checkbox-selected-border': colors.blue500,
            '--dropdown-checkbox-check-color': colors.white,
            '--dropdown-option-label-weight': dimensions.fontWeightMedium,
            '--dropdown-option-description-size': dimensions.fontSizeS,
            '--dropdown-option-description-color': colors.gray400,
            '--dropdown-option-description-margin': dimensions.xs,
            '--dropdown-empty-padding': dimensions.xl,
            '--dropdown-empty-color': colors.gray400,
            '--dropdown-selection-tags-color': colors.blue400,
            '--dropdown-selection-tags-weight': dimensions.fontWeightMedium,
            '--dropdown-option-focused-bg': colors.blue700,
            '--dropdown-option-focused-outline': colors.blue500,
            '--dropdown-color-indicator-size': dimensions.l,
            '--dropdown-color-indicator-margin': dimensions.l,
            '--dropdown-color-indicator-large-size': dimensions.xl,
            '--dropdown-color-indicator-border-color': `${colors.white}1A`,
            '--dropdown-color-indicator-large-margin': dimensions.m,
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
