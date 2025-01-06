/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode, useRef } from 'react';
import styled from 'styled-components';
import { MenuItem as MuiMenuItem, Select as MuiSelect } from '@material-ui/core';
import { KeyboardArrowDown } from '@material-ui/icons';
import { TaskFilterType } from '../../../types';

const PlaceholderText = styled.span`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const MenuItem = styled(MuiMenuItem)`
  padding-inline: 0.5rem;
  padding-block: 0.2rem;
  margin-block: 0.2rem;
`;

const Select = styled(MuiSelect)`
  .MuiInputBase-input {
    background: transparent;
  }
`;

const MenuItemText = styled.span`
  font-size: 0.75rem;
  padding: 0.3rem;
`;

type Option = {
  value: string | number;
  label?: string;
};

interface SelectFilterProps {
  onChange: (value: string) => void;
  filter: { value: TaskFilterType } | undefined;
  renderValue?: (value: Option['value']) => ReactNode;
  options: Option[];
  placeholderValue?: string;
  renderOption?: (option: Option) => ReactNode;
}

export const SelectFilter = ({
  onChange,
  filter,
  renderValue,
  options,
  placeholderValue = 'Select',
  renderOption,
}: SelectFilterProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const filterValue = filter?.value ?? '';

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange(event.target.value as string);
    if (ref.current) {
      ref.current.blur();
      ref.current.classList.remove('Mui-focused');
    }
  };

  const selectedFilterValue = options.find(option => option.value === filterValue);

  const invalidFilterValue = !selectedFilterValue;
  if (invalidFilterValue && filter?.value) {
    onChange('');
  }

  return (
    <Select
      ref={ref}
      value={filter?.value ?? ''}
      onChange={handleChange}
      variant="outlined"
      fullWidth
      displayEmpty
      renderValue={value => {
        if (!value && value !== 0) return <PlaceholderText>{placeholderValue}</PlaceholderText>;
        if (!renderValue) return selectedFilterValue?.label;
        return renderValue(value as Option['value']);
      }}
      IconComponent={KeyboardArrowDown}
    >
      {/** Include a placeholder option so that the user can clear the filter */}
      <MenuItem value="">
        <MenuItemText>Show all</MenuItemText>
      </MenuItem>
      {options.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {renderOption ? renderOption(option) : <MenuItemText>{option.label}</MenuItemText>}
        </MenuItem>
      ))}
    </Select>
  );
};
