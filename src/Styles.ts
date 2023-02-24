export const colors = {
  whiteLabel: 'rgba(255, 255, 255, 0.54)',
  blackLabel: 'rgba(0, 0, 0, 0.87)',
  background: '#141414',
  surface: '#242424',
  surfaceLight: '#c0b3a3',

  KEYWORD: '#ff6470',
  TEXT: '#ACB3BF',
  FUNCTION: '#ffc66d',
  STRING: '#99C47A',
  NUMBER: '#68ABDF',
  PROPERTY: '#AC7BB5',
  COMMENT: '#808586',

  red: '#ef5350',
  green: '#8bc34a',
  blue: '#2196f3',
};

export const baseFont = {
  fontFamily: 'JetBrains Mono',
  fontWeight: 700,
  fontSize: 28,
};

export const codeFont = {
  ...baseFont,
  offsetY: -1,
  padding: 10,
  cache: true,
};

export const whiteLabel = {
  ...baseFont,
  fill: colors.whiteLabel,
};

export const blackLabel = {
  ...baseFont,
  fill: colors.blackLabel,
};
