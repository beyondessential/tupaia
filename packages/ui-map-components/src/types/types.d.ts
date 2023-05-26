import { CssColor } from '@tupaia/types';
import { BREWER_PALETTE } from '../constants';

export type ColorKey = keyof typeof BREWER_PALETTE;
export type Color = ColorKey | 'transparent' | CssColor;
