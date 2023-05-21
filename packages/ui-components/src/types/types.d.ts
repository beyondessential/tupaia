import { ElementType } from 'react';

export type OverrideableComponentProps<P = {}> = P & {
  component?: keyof JSX.IntrinsicElements | ElementType;
};
