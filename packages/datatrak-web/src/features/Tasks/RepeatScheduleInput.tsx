/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import { FormControl } from '@material-ui/core';
import { format, lastDayOfMonth } from 'date-fns';
import { Autocomplete } from '../../components';

export const getRepeatScheduleOptions = dueDate => {
  const noRepeat = {
    label: "Doesn't repeat",
    value: '',
  };

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

  // TODO: When saving, add some logic here when we handle recurring tasks
  return [
    noRepeat,
    {
      label: 'Daily',
      value: 'daily',
    },
    {
      label: `Weekly on ${dayOfWeek}`,
      value: 'weekly',
    },
    {
      label: monthlyOption,
      value: 'monthly',
    },
    {
      label: `Yearly on ${dateOfMonth} of ${month}`,
      value: 'yearly',
    },
  ];
};

interface RepeatScheduleInputProps {
  value: string;
  onChange: (
    value: React.ChangeEvent<{
      name?: string | undefined;
      value: unknown;
    }> | null,
  ) => void;
  disabled?: boolean;
  dueDate?: string | null;
}

export const RepeatScheduleInput = ({
  value = '',
  onChange,
  disabled,
  dueDate,
}: RepeatScheduleInputProps) => {
  const repeatScheduleOptions = getRepeatScheduleOptions(dueDate);

  useEffect(() => {
    if (!dueDate) {
      onChange(null);
    }
  }, [dueDate]);

  const selectedOption =
    repeatScheduleOptions.find(option => option.value === value) ?? repeatScheduleOptions[0];

  return (
    <FormControl fullWidth disabled={disabled}>
      <Autocomplete
        id="repeatSchedule"
        value={selectedOption}
        onChange={(_, newValue) => {
          return onChange(newValue?.value ?? null);
        }}
        disabled={!dueDate || disabled}
        options={repeatScheduleOptions}
        getOptionLabel={option => option.label}
        label="Repeating task"
        muiProps={{
          disableClearable: !value,
        }}
      />
    </FormControl>
  );
};