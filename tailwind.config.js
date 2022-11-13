/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './renderer/pages/**/*.{js,ts,jsx,tsx}',
        './renderer/components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [require('@tailwindcss/line-clamp'),require('tailwind-scrollbar-hide')],
};
