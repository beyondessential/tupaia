import { TaskStatus } from '@tupaia/types';
import React from 'react';
import { TaskFilterType } from '../../../types';
import { STATUS_VALUES, StatusPill } from '../StatusPill';
import { SelectFilter } from './SelectFilter';
import { useTasksTable } from './useTasksTable';

interface StatusFilterProps {
  onChange: (value: string) => void;
  filter: { value: TaskFilterType } | undefined;
}

export const StatusFilter = ({ onChange, filter }: StatusFilterProps) => {
  const { showCompleted, showCancelled } = useTasksTable();

  const options = Object.keys(STATUS_VALUES)
    .filter(value => {
      // Filter out completed and cancelled tasks if the user has disabled them
      return !(
        (!showCompleted && value === TaskStatus.completed) ||
        (!showCancelled && value === TaskStatus.cancelled)
      );
    })
    .map(value => ({ value }));

  return (
    <SelectFilter
      options={options}
      onChange={onChange}
      filter={filter}
      renderValue={value => <StatusPill status={value as TaskStatus} />}
      placeholderValue="Show all"
      renderOption={option => <StatusPill status={option.value as TaskStatus} />}
    />
  );
};
