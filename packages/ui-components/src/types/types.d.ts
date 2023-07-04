import { ElementType } from 'react';

export type OverrideableComponentProps<P = {}> = P & {
  component?: keyof JSX.IntrinsicElements | ElementType;
};

export type MatrixColumnType = {
  key: string;
  title: string;
};

export type MatrixRowType = {
  title: string;
  children?: MatrixRow[];
  [key: string]: any;
};
