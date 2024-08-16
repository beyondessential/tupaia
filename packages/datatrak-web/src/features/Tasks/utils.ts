/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { SingleTaskResponse } from '../../types';
import { getRepeatScheduleOptions } from './RepeatScheduleInput';

export const getDisplayRepeatSchedule = (task: SingleTaskResponse) => {
  const repeatScheduleOptions = getRepeatScheduleOptions(task.taskDueDate);
  const { label } = repeatScheduleOptions[0];
  if (!task.repeatSchedule) {
    return label;
  }
  const { freq } = task.repeatSchedule;
  const selectedOption = repeatScheduleOptions.find(option => option.value === freq);
  if (selectedOption) return selectedOption.label;
  return label;
};
