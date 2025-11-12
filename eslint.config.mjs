import nextPlugin from 'eslint-config-next';

const eslintConfig = [
  {
    ignores: ['.next/*'],
  },
  ...nextPlugin,
];

export default eslintConfig;
