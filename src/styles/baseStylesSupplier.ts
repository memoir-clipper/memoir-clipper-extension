import { Variant } from '@/utils/values/enums';

export abstract class BaseStylesSupplier {
    protected abstract baseStyles: string;
    protected abstract stylesMap: Record<Variant, string>;
    protected abstract cssVarMap: Record<Variant, Record<string, string>>;

    /** Returns combined CSS for the given variant */
    public getStyles(variant: Variant): string {
        const variantStyles = this.stylesMap[variant] ?? this.defaultStyles;
        const cssVariables = this.generateCSSVariables(variant);

        return [cssVariables, this.baseStyles, variantStyles].filter(Boolean).join('\n');
    }

    /** Generates :root CSS variables block for the given variant */
    private generateCSSVariables(variant: Variant): string {
        const variables = this.cssVarMap[variant];
        if (!variables || Object.keys(variables).length === 0) return '';

        const cssVars = Object.entries(variables)
            .map(([key, value]) => `  ${key}: ${value};`)
            .join('\n');

        return `:root {\n${cssVars}\n}`;
    }

    protected get defaultStyles(): string {
        return this.stylesMap[Variant.LIGHT];
    }

    protected classSelector(className: string): string {
        return `.${className}`;
    }

    protected cssVar(name: string): string {
        return `var(${name})`;
    }
}
