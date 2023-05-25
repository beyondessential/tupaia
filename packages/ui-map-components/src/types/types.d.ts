import { CssColor } from '@tupaia/types';
import { BREWER_PALETTE } from '../constants';

export type Color = keyof typeof BREWER_PALETTE | 'transparent' | CssColor;
