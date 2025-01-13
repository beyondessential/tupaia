import React, { useEffect } from 'react';
import { FormControl } from '@material-ui/core';
import { Autocomplete } from '../../components';
import { getRepeatScheduleOptions } from './utils';

interface RepeatScheduleInputProps {
  value: string | null;
  onChange: (
    value: React.ChangeEvent<{
      name?: string | undefined;
      value: string | null;
    }> | null,
  ) => void;
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
      <Autocomplete
        id="repeatFrequency"
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
