module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --cache --fix', 'prettier --write'],
  '*.{css,scss,md,json,html}': ['prettier --write'],
};
