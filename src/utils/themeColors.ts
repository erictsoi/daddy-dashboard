/**
 * themeColors.ts
 *
 * Maps Tailwind colour names (stored on ChildProfile.themeColor)
 * back to hex values for use in inline styles.
 */

const THEME_HEX: Record<string, string> = {
  blue:   '#2B8ED4',
  purple: '#9B6DD6',
  green:  '#4CAF8A',
  rose:   '#E8507A',
  amber:  '#F5A623',
  red:    '#FF6B6B',
  teal:   '#4ECDC4',
  orange: '#FF8C42',
  pink:   '#FF69B4',
  indigo: '#6366F1',
};

export const getThemeHexColor = (themeColor: string): string =>
  THEME_HEX[themeColor] ?? THEME_HEX.blue;

export const THEME_COLOR_NAMES = Object.keys(THEME_HEX) as (keyof typeof THEME_HEX)[];
