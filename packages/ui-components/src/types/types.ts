import { ElementType, CSSProperties } from 'react';
import { OverridableComponent } from '@material-ui/core/OverridableComponent';
import { SvgIconTypeMap } from '@material-ui/core';

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

export type ActionsMenuOptionType = {
  label: string;
  action: () => void;
  style?: CSSProperties;
  iconStyle?: CSSProperties;
  ActionIcon?:
    | OverridableComponent<SvgIconTypeMap<Record<string, unknown>, 'svg'>>
    | React.ElementType;
  toolTipTitle?: string;
  color?: string;
};
