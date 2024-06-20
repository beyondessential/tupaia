/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MenuItem as MuiMenuItem, Select } from '@material-ui/core';
import { STATUS_VALUES, StatusPill } from './StatusPill';

const PlaceholderText = styled.span`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const MenuItem = styled(MuiMenuItem)`
  padding-inline: 0.5rem;
  padding-block: 0.2rem;
  margin-block: 0.2rem;
`;

interface StatusFilterProps {
  onChange: (value: string) => void;
  filter: { value: string } | undefined;
}

export const StatusFilter = ({ onChange, filter }: StatusFilterProps) => {
  const options = Object.entries(STATUS_VALUES).map(([value, { label }]) => ({
    value,
    label,
  }));

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onChange(event.target.value as string);
  };

  return (
    <Select
      value={filter?.value ?? ''}
      onChange={handleChange}
      variant="outlined"
      fullWidth
      displayEmpty
      renderValue={value => {
        if (!value) return <PlaceholderText>Select</PlaceholderText>;
        return <StatusPill status={value as string} />;
      }}
    >
      <MenuItem value="">All</MenuItem>
      {options.map(option => (
        <MenuItem key={option.value} value={option.value}>
          <StatusPill status={option.value} />
        </MenuItem>
      ))}
    </Select>
  );
};
