import { CSSProperties, ElementType } from 'react';

// the Record<any, any> is to allow for any prop to be passed to the component, for the component that is overriding the original
export type OverrideableComponentProps<P = {}> = P &
  Record<any, any> & {
    component?: keyof JSX.IntrinsicElements | ElementType;
  };

export type MatrixColumnType = {
  key: string;
  title: string;
  entityLink?: string;
  children?: MatrixColumnType[];
};

export type MatrixRowType = Record<string, any> & {
  title: string;
  children?: MatrixRowType[];
};

export type Data = Record<string, unknown> & {
  name?: string;
  value?: any;
};

export interface ActionsMenuOptionType {
  label: string;
  action: () => void;
  style?: CSSProperties;
  iconStyle?: CSSProperties;
  actionIcon?: React.ReactNode;
  toolTipTitle?: string;
}
