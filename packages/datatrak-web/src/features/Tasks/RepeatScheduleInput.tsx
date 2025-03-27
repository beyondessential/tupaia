import { FormControl } from '@material-ui/core';
import React, { useEffect } from 'react';
import { Frequency } from 'rrule';

import { Autocomplete } from '../../components';
import { RepeatScheduleOption, getRepeatScheduleOptions } from './utils';

interface RepeatScheduleInputProps {
  value: string | null;
  onChange: (value: Frequency | null) => void;
  disabled?: boolean;
  dueDate?: string | null;
}

export const RepeatScheduleInput = ({
  value = null,
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
      <Autocomplete<RepeatScheduleOption>
        id="repeatFrequency"
        value={selectedOption}
        onChange={(_event: React.ChangeEvent<{}>, newValue: RepeatScheduleOption | null) => {
          console.log('RepeatScheduleInput:38 onChange', { _event, newValue });
          return onChange(newValue?.value ?? null);
        }}
        disabled={!dueDate || disabled}
        options={repeatScheduleOptions}
        getOptionLabel={(option: RepeatScheduleOption) => option.label}
        label="Repeating task"
        muiProps={{
          disableClearable: !value,
        }}
      />
    </FormControl>
  );
};
