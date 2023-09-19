/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Platform } from 'react-native';

const ORANGE = '#EE6230';
const WHITE = '#FFFFFF';
const BLUE = '#0A7EC3';
const GREY = '#C7C7C7';
const GREEN = 'green';
const BLACK = 'black';

export const BASELINE_FONT_SIZE = 10;

export const THEME_FONT_FAMILY = Platform.OS === 'ios' ? 'Helvetica' : 'Roboto';
export const THEME_COLOR_ONE = WHITE;
export const THEME_COLOR_TWO = BLUE;
export const THEME_COLOR_THREE = ORANGE;
export const THEME_COLOR_FOUR = GREY;
export const THEME_COLOR_FIVE = GREEN;
export const THEME_COLOR_SIX = BLACK;
export const THEME_COLOR_DARK = '#333';
export const THEME_COLOR_LIGHT = '#f2f2f2';
export const THEME_COLOR_SIDEMENU_ICON = '#666';
export const THEME_TEXT_COLOR_ONE = WHITE;
export const THEME_TEXT_COLOR_TWO = WHITE;
export const THEME_TEXT_PLACEHOLDER_COLOR = '#DDD';
export const THEME_TEXT_COLOR_THREE = '#191919';
export const THEME_TEXT_COLOR_FOUR = '#545454';
export const PIG_PINK = '#FF5A83';
export const BACKGROUND_COLOR_TOP = '#0a7ec3';
export const BACKGROUND_COLOR_BOTTOM = '#3c91c8';
export const THEME_OVERLAY_BACKGROUND_COLOUR = '#313131e5';
export const THEME_FONT_SIZE_ONE = BASELINE_FONT_SIZE * 1.6;
export const THEME_FONT_SIZE_TWO = BASELINE_FONT_SIZE * 1.8;
export const THEME_FONT_SIZE_THREE = BASELINE_FONT_SIZE * 2;
export const THEME_FONT_SIZE_FOUR = BASELINE_FONT_SIZE * 3;
export const THEME_SECTION_BORDER_COLOR = '#DFDFDF';
export const HEADER_HEIGHT = 40;
export const DEFAULT_PADDING = 16;
export const BORDER_RADIUS = 2;
export const SMALL_PHONE_WIDTH = 350;

export const FEED_TITLE_TEXT_STYLE = {
  fontWeight: 'bold',
  fontSize: 18,
  marginBottom: 10,
  color: THEME_TEXT_COLOR_FOUR,
};

export const getThemeColorOneFaded = opacity => `rgba(255,255,255,${opacity})`;
export const getGreyShade = darkness => {
  const eightBitShade = Math.floor(255 * (1 - darkness));
  return `rgb(${eightBitShade},${eightBitShade},${eightBitShade})`;
};
export const getLineHeight = (fontSize, multiplier = 1.3) => Math.floor(fontSize * multiplier);
