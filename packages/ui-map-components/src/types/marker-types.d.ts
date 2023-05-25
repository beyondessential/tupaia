import { ReactNode } from 'react';
import { Color } from './types';
import { IconKey } from '../components';

export type MarkerProps = {
  radius?: number | string;
  color?: Color;
  children?: ReactNode;
  coordinates: [number, number];
  scale?: number;
  handleClick?: (e: any) => void;
  icon?: IconKey;
};
