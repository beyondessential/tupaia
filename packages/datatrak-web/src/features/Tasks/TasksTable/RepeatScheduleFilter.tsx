/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { RRULE_FREQUENCIES } from '@tupaia/utils';
import { TaskFilterType } from '../../../types';
import { SelectFilter } from './SelectFilter';

interface RepeatScheduleFilterProps {
  onChange: (value: string) => void;
  filter: { value: TaskFilterType } | undefined;
}

export const RepeatScheduleFilter = ({ onChange, filter }: RepeatScheduleFilterProps) => {
  // if there is a selected status filter and it is not 'repeating', no options should show
  const options = Object.entries(RRULE_FREQUENCIES).map(([key, value]) => ({
    value,
    label: `${key.charAt(0)}${key.slice(1).toLowerCase()}`,
  }));

  return (
    <SelectFilter options={options} onChange={onChange} filter={filter} placeholderValue="Select" />
  );
};
