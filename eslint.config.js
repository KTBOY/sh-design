import js from '@eslint/js'
import ts from 'typescript-eslint'
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default ts.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/scripts/**',
      '**/.vitepress/cache/**',
      '**/.vitepress/dist/**',
      // Qoder 工具产物（评审报告等），不参与代码检查
      '**/.qoder/**'
    ]
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ]
    }
  },
  prettier
)
