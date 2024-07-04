/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { MenuItem as MuiMenuItem, Select } from '@material-ui/core';
import { TaskStatus } from '@tupaia/types';
import { STATUS_VALUES, StatusPill } from '../StatusPill';
import { FilterType, getTaskFilterSetting } from '../utils/taskFilterSettings';

const PlaceholderText = styled.span`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

const PlaceholderOption = styled(MuiMenuItem)`
  font-size: 0.75rem;
  padding-inline: 0.8rem;
`;

const MenuItem = styled(MuiMenuItem)`
  padding-inline: 0.5rem;
  padding-block: 0.2rem;
  margin-block: 0.2rem;
`;

interface StatusFilterProps {
  onChange: (value: string) => void;
  filter: { value: FilterType } | undefined;
}

export const StatusFilter = ({ onChange, filter }: StatusFilterProps) => {
  const includeCompletedTasks = getTaskFilterSetting('all_completed_tasks');
  const includeCancelledTasks = getTaskFilterSetting('all_cancelled_tasks');

  const options = Object.keys(STATUS_VALUES)
    .filter(value => {
      // Filter out completed and cancelled tasks if the user has disabled them
      if (
        (!includeCompletedTasks && value === TaskStatus.completed) ||
        (!includeCancelledTasks && value === TaskStatus.cancelled)
      ) {
        return false;
      }
      return true;
    })
    .map(value => ({ value }));

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
        return <StatusPill status={value as TaskStatus} />;
      }}
    >
      {/** Include a placeholder option so that the user can clear the status filter */}
      <PlaceholderOption value="">Show all</PlaceholderOption>
      {options.map(option => (
        <MenuItem key={option.value} value={option.value}>
          <StatusPill status={option.value as TaskStatus} />
        </MenuItem>
      ))}
    </Select>
  );
};
