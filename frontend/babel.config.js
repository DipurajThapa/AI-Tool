module.exports = {
    presets: ['next/babel'],
    plugins: [
        [
            'module-resolver',
            {
                root: ['./src'],
                alias: {
                    '@': './src',
                },
            },
        ],
    ],
} 