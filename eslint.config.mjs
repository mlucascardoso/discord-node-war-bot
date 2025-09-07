import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
    globalIgnores(['dist']),
    {
        files: ['**/*.js'],
        plugins: {
            prettier
        },
        extends: [
            js.configs.recommended,
        ],
        languageOptions: {
            ecmaVersion: 2024,
            globals: globals.node,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        rules: {
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                    tabWidth: 4,
                    trailingComma: 'none',
                    bracketSpacing: true,
                    printWidth: 180
                }
            ],
            'no-unused-vars': [
                'error',
                {
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^ignore',
                    ignoreRestSiblings: true
                }
            ],
            'eol-last': 'error',
            indent: [
                'error',
                4,
                {
                    SwitchCase: 1
                }
            ],
            'linebreak-style': 'off',
            'max-len': ['error', 180],
            'max-lines-per-function': ['warn', 50],
            'object-curly-spacing': ['error', 'always'],
            quotes: ['error', 'single'],
            'quote-props': ['error', 'as-needed'],
            semi: ['error', 'always'],
            'sort-imports': [
                'error',
                {
                    memberSyntaxSortOrder: ['single', 'all', 'multiple', 'none'],
                    allowSeparatedGroups: true
                }
            ]
        }
    },
]);
