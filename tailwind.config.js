/** @type {import('tailwindcss').Config} */
// tailwind.config.js
module.exports = {
    // "#__next" 内、あるいは ".tailwind-scope" 内のクラスだけを優先させる
    important: '.tailwind-scope', 
    content: [
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    corePlugins: {
        // 既存のWikiデザインを壊さないよう、Tailwind標準のリセットCSS（Preflight）をオフにする
        preflight: false,
    },
    theme: {
        extend: {},
    },
    plugins: [],
}