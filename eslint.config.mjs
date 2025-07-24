import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const eslintConfig = [
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript', 'prettier'],

    plugins: ['prettier'],
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': [
        'error',
        {
          endOfLine: 'auto'
        }
      ],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@next/next/no-img-element': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      semi: 'off'
    }
  })
]

export default eslintConfig
