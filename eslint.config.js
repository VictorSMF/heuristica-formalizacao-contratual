const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
    eslintConfigPrettier,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                process: 'readonly',
                __dirname: 'readonly',
                require: 'readonly',
                module: 'readonly',
                console: 'readonly',
                fetch: 'readonly',
                AbortSignal: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly'
            }
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'error'
        }
    }
];
