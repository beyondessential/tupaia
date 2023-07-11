import { ElementType } from 'react';

// the Record<any, any> is to allow for any prop to be passed to the component, for the component that is overriding the original
export type OverrideableComponentProps<P = {}> = P &
  Record<any, any> & {
    component?: keyof JSX.IntrinsicElements | ElementType;
  };

export type MatrixColumnType = {
  key: string;
  title: string;
};

export type MatrixRowType = Record<string, any> & {
  title: string;
  children?: MatrixRowType[];
};
