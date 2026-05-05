/** @type {import("prettier").Config} */
export default {
  semi: true,
  tabWidth: 2,
  singleQuote: true,
  printWidth: 80,
  trailingComma: 'none',
  singleAttributePerLine: true,
  plugins: ['prettier-plugin-astro', 'prettier-plugin-tailwindcss'],
  overrides: [
    {
      files: '*.astro',
      options: {
        parser: 'astro'
      }
    }
  ]
};
