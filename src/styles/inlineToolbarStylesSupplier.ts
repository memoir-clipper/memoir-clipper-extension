import { colors } from './colors';
import { dimensions } from './dimensions';
import { CLASS_INLINE_TOOLBAR, CLASS_INLINE_TOOLBAR_VISIBLE, CLASS_INLINE_TOOLBAR_SHORTCUT } from '@/utils/values/ids';
import { BaseStylesSupplier } from './baseStylesSupplier';
import { Variant } from '@/utils/values/enums';

export class InlineToolbarStylesSupplier extends BaseStylesSupplier {
    protected baseStyles = `
        ${this.classSelector(CLASS_INLINE_TOOLBAR)} {
            position: absolute;
            z-index: 999999;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: ${this.cssVar('--toolbar-gap')};
            backdrop-filter: ${this.cssVar('--toolbar-backdrop-filter')};
            border-radius: ${this.cssVar('--toolbar-border-radius')};
            box-shadow: ${this.cssVar('--toolbar-shadow')};
            padding: ${this.cssVar('--toolbar-padding')};
            font-family: ${this.cssVar('--toolbar-font-family')};
            font-size: ${this.cssVar('--toolbar-font-size')};
            transform-origin: top center;
            opacity: 0;
            transform: translateY(-${dimensions.xs}) scale(0.98);
            pointer-events: none;
            transition: ${this.cssVar('--toolbar-transition')};
            background: ${this.cssVar('--toolbar-bg')};
            border: ${this.cssVar('--toolbar-border')};
        }
        
        ${this.classSelector(CLASS_INLINE_TOOLBAR)}.${CLASS_INLINE_TOOLBAR_VISIBLE} {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: auto;
        }
        
        ${this.classSelector(CLASS_INLINE_TOOLBAR_SHORTCUT)} {
            padding: ${this.cssVar('--toolbar-shortcut-padding')};
            border-radius: ${this.cssVar('--toolbar-shortcut-border-radius')};
            font-size: ${this.cssVar('--toolbar-shortcut-font-size')};
            font-family: ${this.cssVar('--toolbar-shortcut-font-family')};
            background: ${this.cssVar('--toolbar-shortcut-bg')};
            color: ${this.cssVar('--toolbar-shortcut-color')};
            border: ${this.cssVar('--toolbar-shortcut-border')};
        }
    `;

    protected cssVarMap: Record<Variant, Record<string, string>> = {
        [Variant.LIGHT]: {
            '--toolbar-gap': dimensions.l,
            '--toolbar-backdrop-filter': 'blur(10px)',
            '--toolbar-border-radius': dimensions.borderRadiusL,
            '--toolbar-shadow': dimensions.shadowHeavy,
            '--toolbar-padding': `${dimensions.m} ${dimensions.l}`,
            '--toolbar-font-family': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '--toolbar-font-size': dimensions.fontSizeL,
            '--toolbar-transition': dimensions.transitionBounce,
            '--toolbar-bg': `${colors.white}F2`,
            '--toolbar-border': `1px solid ${colors.black}14`,
            '--toolbar-shortcut-padding': `${dimensions.xs} 5px`,
            '--toolbar-shortcut-border-radius': dimensions.borderRadiusS,
            '--toolbar-shortcut-font-size': dimensions.fontSizeS,
            '--toolbar-shortcut-font-family': '"SFMono-Regular", Consolas, monospace',
            '--toolbar-shortcut-bg': colors.gray100,
            '--toolbar-shortcut-color': colors.gray700,
            '--toolbar-shortcut-border': `1px solid ${colors.gray300}`,
        },
        [Variant.DARK]: {
            '--toolbar-gap': dimensions.l,
            '--toolbar-backdrop-filter': 'blur(10px)',
            '--toolbar-border-radius': dimensions.borderRadiusL,
            '--toolbar-shadow': dimensions.shadowDark,
            '--toolbar-padding': `${dimensions.m} ${dimensions.l}`,
            '--toolbar-font-family': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            '--toolbar-font-size': dimensions.fontSizeL,
            '--toolbar-transition': dimensions.transitionBounce,
            '--toolbar-bg': `${colors.darkBg}F2`,
            '--toolbar-border': `1px solid ${colors.white}1A`,
            '--toolbar-shortcut-padding': `${dimensions.xs} 5px`,
            '--toolbar-shortcut-border-radius': dimensions.borderRadiusS,
            '--toolbar-shortcut-font-size': dimensions.fontSizeS,
            '--toolbar-shortcut-font-family': '"SFMono-Regular", Consolas, monospace',
            '--toolbar-shortcut-bg': colors.gray600,
            '--toolbar-shortcut-color': colors.gray50,
            '--toolbar-shortcut-border': `1px solid ${colors.gray500}`,
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
