const js = require('@eslint/js');
const globals = require('globals');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2020,
            sourceType: 'commonjs',
            globals: { ...globals.node },
        },
        rules: {
            'prefer-const': ['warn', { destructuring: 'all' }],
            'no-console': 'off',
        },
    },
    eslintPluginPrettierRecommended,
];
