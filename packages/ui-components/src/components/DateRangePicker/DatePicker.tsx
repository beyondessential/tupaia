/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { ChangeEvent, FC, ReactNode } from 'react';
import { SelectField } from '../Inputs';

export const DatePicker: FC<{
  label: string;
  selectedValue: number;
  onChange: (event: ChangeEvent<{ value: any }>) => void;
  menuItems: ReactNode[];
}> = ({ label, selectedValue, onChange, menuItems }) => (
  <SelectField label={label} value={selectedValue} onChange={onChange}>
    {menuItems}
  </SelectField>
);
