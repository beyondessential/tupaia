import { ReactNode } from 'react';

export type ListItemType = Record<string, unknown> & {
  children?: ListItemType[];
  content: ReactNode;
  value: string;
  selected?: boolean;
  icon?: ReactNode;
  tooltip?: string;
  button?: boolean;
  disabled?: boolean;
};
