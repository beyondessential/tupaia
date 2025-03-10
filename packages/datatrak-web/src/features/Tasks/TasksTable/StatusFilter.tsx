import React from 'react';
import { TaskStatus } from '@tupaia/types';
import { STATUS_VALUES, StatusPill } from '../StatusPill';
import { getTaskFilterSetting } from '../../../utils';
import { TaskFilterType } from '../../../types';
import { SelectFilter } from './SelectFilter';

interface StatusFilterProps {
  onChange: (value: string) => void;
  filter: { value: TaskFilterType } | undefined;
}

export const StatusFilter = ({ onChange, filter }: StatusFilterProps) => {
  const includeCompletedTasks = getTaskFilterSetting('show_completed_tasks');
  const includeCancelledTasks = getTaskFilterSetting('show_cancelled_tasks');

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
