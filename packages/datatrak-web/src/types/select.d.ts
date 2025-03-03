import { ReactNode } from 'react';

export interface SelectOption {
  label: ReactNode;
  value?: string | number;
}

export type SelectOptions = SelectOption[];
