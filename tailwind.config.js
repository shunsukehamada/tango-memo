/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './renderer/pages/**/*.{js,ts,jsx,tsx}',
        './renderer/components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    darkMode: 'class',
    plugins: [require('@tailwindcss/line-clamp'),require('tailwind-scrollbar-hide')],
};
