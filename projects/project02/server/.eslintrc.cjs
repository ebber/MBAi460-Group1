// Sub-phase 1.0 placeholder. Full lint kit (husky, lint-staged, commitlint, eslint
// rule packs) lands in Approach Phase 1 § Task 1.3. Until then this minimal config
// keeps the surface lintable from day one without dragging in transitive dev deps.
module.exports = {
  root: true,
  env: { node: true, es2024: true, jest: true },
  parserOptions: { ecmaVersion: 'latest', sourceType: 'commonjs' },
  ignorePatterns: ['node_modules/', '_assignment-template/'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
};
