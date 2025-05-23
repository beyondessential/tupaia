import React, { ChangeEvent, ReactNode } from 'react';
import { SelectField } from '../Inputs';

export const DatePicker = ({
  label,
  selectedValue,
  onChange,
  menuItems,
}: {
  label: string;
  selectedValue: number | undefined;
  onChange: (event: ChangeEvent<{ value: any }>) => void;
  menuItems: ReactNode[];
}) => (
  <SelectField label={label} value={selectedValue} onChange={onChange}>
    {menuItems}
  </SelectField>
);
