const { nextui } = require('@nextui-org/react')

import type { Config } from 'tailwindcss'

export default {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},

        fontFamily: {
            sans: ['ThemeVCK', 'sans-serif'],
            silkscreen: ['ThemeVCK', 'sans-serif'],
        },
    },
    darkMode: 'class',
    plugins: [
        nextui({
            defaultTheme: 'light',
            themes: {
                light: {
                    colors: {
                        content1: '#d4d4d8',
                        divider: '#27272a',
                    },
                },
            },
        }),
        require('@tailwindcss/typography'),
    ],
} satisfies Config
