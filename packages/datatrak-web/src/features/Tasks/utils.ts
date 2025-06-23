import { format, lastDayOfMonth } from 'date-fns';
import { Frequency } from 'rrule';

import { RRULE_FREQUENCIES } from '@tupaia/utils';

import { SingleTaskResponse } from '../../types';

const noRepeat = {
  label: 'Doesn’t repeat',
  value: null,
} as const;

interface RepeatingRepeatScheduleOption {
  readonly label: string;
  readonly value: Frequency;
}

export type RepeatScheduleOption = typeof noRepeat | RepeatingRepeatScheduleOption;

type RepeatScheduleOptions = [typeof noRepeat, ...RepeatingRepeatScheduleOption[]];

export const getRepeatScheduleOptions = (dueDate): RepeatScheduleOptions => {
  if (!dueDate) {
    return [noRepeat];
  }

  const dueDateObject = new Date(dueDate);

  const dayOfWeek = format(dueDateObject, 'EEEE');
  const dateOfMonth = format(dueDateObject, 'do');

  const month = format(dueDateObject, 'MMMM');

  const lastDateOfMonth = format(lastDayOfMonth(dueDateObject), 'do');

  const isLastDayOfMonth = dateOfMonth === lastDateOfMonth;

  // If the due date is the last day of the month, we don't need to show the date, just always repeat on the last day. Otherwise, show the date.
  // In the case of February, if the selected date is, for example, the 29th/30th/31st of June, we would repeat on the last day of the month.
  const monthlyOption = isLastDayOfMonth
    ? 'Monthly on the last day'
    : `Monthly on the ${dateOfMonth}`;

  return [
    noRepeat,
    {
      label: 'Daily',
      value: RRULE_FREQUENCIES.DAILY,
    },
    {
      label: `Weekly on ${dayOfWeek}`,
      value: RRULE_FREQUENCIES.WEEKLY,
    },
    {
      label: monthlyOption,
      value: RRULE_FREQUENCIES.MONTHLY,
    },
    {
      label: `Yearly on ${dateOfMonth} of ${month}`,
      value: RRULE_FREQUENCIES.YEARLY,
    },
  ];
};

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

export const capsToSentenceCase = (str: string) => {
  return `${str.charAt(0)}${str.slice(1).toLowerCase()}`;
};
