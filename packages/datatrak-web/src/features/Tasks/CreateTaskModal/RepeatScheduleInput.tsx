/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Select as BaseSelect, MenuItem, FormControl, FormLabel } from '@material-ui/core';
import { format, lastDayOfMonth } from 'date-fns';
import { useWatch } from 'react-hook-form';
import styled from 'styled-components';

const Select = styled(BaseSelect)`
  &.Mui-disabled {
    background-color: ${({ theme }) => theme.palette.background.default};
  }
`;

const useRepeatScheduleOptions = dueDate => {
  const noRepeat = {
    label: 'Does not repeat',
    value: '',
  };

  if (!dueDate) {
    return [noRepeat];
  }

  const dueDateObject = new Date(dueDate);

  const dayOfWeek = format(dueDateObject, 'EEEE');
  const dateOfMonth = format(dueDateObject, 'do');

  const month = format(dueDateObject, 'MMM');

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
    }>,
  ) => void;
}

export const RepeatScheduleInput = ({ value = '', onChange }: RepeatScheduleInputProps) => {
  const { dueDate } = useWatch('dueDate');
  const repeatScheduleOptions = useRepeatScheduleOptions(dueDate);
  return (
    <FormControl fullWidth>
      <FormLabel htmlFor="repeatSchedule">Repeating task</FormLabel>
      <Select
        id="repeatSchedule"
        value={value}
        onChange={onChange}
        fullWidth
        variant="outlined"
        disabled={!dueDate}
        displayEmpty
      >
        {repeatScheduleOptions.map(option => (
          <MenuItem key={option.label} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
