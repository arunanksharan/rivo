import { colors } from './colors';
import { spacing } from './spacing';
import { typography, fontSize, fontWeight, lineHeight, fontFamily } from './typography';

export const theme = {
  colors,
  spacing,
  typography,
  fontSize,
  fontWeight,
  lineHeight,
  fontFamily,
};

export type Theme = typeof theme;

export * from './colors';
export * from './spacing';
export * from './typography';
