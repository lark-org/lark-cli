module.exports = {
  extends: 'lark',
  rules: {
    // your overrides
    'compat/compat': 0,
    'class-methods-use-this': 0,
    'import/prefer-default-export': 0,
    'no-console': 0,
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
  }
}
