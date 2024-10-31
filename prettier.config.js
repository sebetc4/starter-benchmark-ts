/** @type {import("prettier").Config} */
export default {
    plugins: ['@trivago/prettier-plugin-sort-imports'],
    printWidth: 100,
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    bracketSameLine: false,
    singleAttributePerLine: true,
    importOrder: [
        '.*\\.(css|scss)$',
        '^@?\\w',
        '^(?!@/types)(@/|.)',
        '^@/types',
    ],
    importOrderSeparation: true,
    importOrderSortSpecifiers: true,
}
