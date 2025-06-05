import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                project: './tsconfig.json',
            },
            globals: {
                ...globals.browser,
                ...globals.es2021,
                ...globals.webextensions,
                // Chrome extension globals
                chrome: 'readonly',
                browser: 'readonly',
            },
        },
        plugins: {
            '@typescript-eslint': typescriptEslint,
            prettier: prettier,
        },
        rules: {
            // More lenient Prettier integration
            'prettier/prettier': [
                'error',
                {
                    printWidth: 120,
                    singleQuote: true,
                    trailingComma: 'all',
                    bracketSpacing: true,
                    arrowParens: 'avoid',
                    semi: true,
                    tabWidth: 4,
                },
                {
                    usePrettierrc: false, // Don't override manual formatting
                },
            ],

            // Code quality rules only
            'no-console': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                    args: 'after-used',
                    caughtErrors: 'none',
                },
            ],
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    disallowTypeAnnotations: false,
                },
            ],

            // Disable all formatting rules to avoid conflicts
            'max-len': 'off',
            'object-curly-newline': 'off',
            'object-property-newline': 'off',
            'array-element-newline': 'off',
            'function-call-argument-newline': 'off',
            'function-paren-newline': 'off',
            'brace-style': 'off',
            'comma-dangle': 'off',
            'object-curly-spacing': 'off',
            'array-bracket-spacing': 'off',
            'comma-spacing': 'off',
            'key-spacing': 'off',
            'semi-spacing': 'off',
            'space-before-blocks': 'off',
            'space-in-parens': 'off',
            'space-infix-ops': 'off',
            'keyword-spacing': 'off',
            indent: 'off',
            '@typescript-eslint/indent': 'off',

            // Keep only semantic rules
            'no-undef': 'error',
            '@typescript-eslint/prefer-promise-reject-errors': 'error',
            '@typescript-eslint/no-floating-promises': 'off',
            '@typescript-eslint/await-thenable': 'error',
            'no-eval': 'error',
            'no-implied-eval': 'error',
            'no-new-func': 'error',
            'no-script-url': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            'prefer-promise-reject-errors': 'error',
            'no-throw-literal': 'error',
            'no-inner-declarations': 'error',
            'no-loop-func': 'error',
            'consistent-return': 'warn',
            'default-case': 'warn',
            'dot-notation': 'error',
            eqeqeq: ['error', 'always'],
            'no-duplicate-imports': 'error',
            'no-return-assign': 'error',
            'no-self-compare': 'error',
            'no-unused-expressions': 'error',
            'prefer-const': 'error',
            'prefer-template': 'error',
            '@typescript-eslint/no-inferrable-types': 'error',
            '@typescript-eslint/prefer-optional-chain': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
        },
    },
    {
        // Background script specific rules
        files: ['**/background/**/*.{ts,js}', '**/service-worker/**/*.{ts,js}'],
        rules: {
            'no-console': 'warn', // Allow console in background for debugging
        },
    },
    {
        // Content script specific rules
        files: ['**/content/**/*.{ts,js}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                document: 'readonly',
                window: 'readonly',
            },
        },
        rules: {
            'no-console': 'off', // Allow console in content scripts
        },
    },
    {
        // Popup/options page rules
        files: ['**/popup/**/*.{ts,js}', '**/options/**/*.{ts,js}'],
        languageOptions: {
            globals: {
                ...globals.browser,
                document: 'readonly',
                window: 'readonly',
            },
        },
    },
    {
        // Configuration files
        files: ['*.config.{js,ts}', 'vite.config.{js,ts}', 'rollup.config.{js,ts}'],
        rules: {
            'no-console': 'off',
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
    // This must be last to disable conflicting rules
    prettierConfig,
];
