import { ReactNode } from 'react';

export interface ListItemType extends Record<string, unknown> {
  children?: ListItemType[];
  content: string | ReactNode;
  value: string;
  selected?: boolean;
  icon?: ReactNode;
  tooltip?: string;
  button?: boolean;
  disabled?: boolean;
}
