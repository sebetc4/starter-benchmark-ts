import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import pluginPrettier from 'eslint-plugin-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        files: ['**/*.{ts}'],
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            prettier: pluginPrettier,
        },
        rules: {
            'prettier/prettier': 'warn',
        },
    },
    jsxA11y.flatConfigs.recommended,
    prettier,
    { ignores: ['dist', 'node_modules'] },
)
