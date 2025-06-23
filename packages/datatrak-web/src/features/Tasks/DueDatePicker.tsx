import React, { useEffect, useState } from 'react';
import { format, isValid } from 'date-fns';
import styled from 'styled-components';
import { DatePicker } from '@tupaia/ui-components';

const Wrapper = styled.div`
  .MuiFormControl-root {
    margin-block-end: 0;
  }
  .MuiButtonBase-root.MuiIconButton-root {
    color: ${props => props.theme.palette.primary.main};
  }
  .MuiInputBase-input {
    padding-inline-end: 0;
    padding-inline-start: 1rem;
    font-size: inherit;
    line-height: normal;
    color: inherit;
  }
  .MuiInputAdornment-positionEnd {
    margin-inline-start: 0;
  }
  .MuiOutlinedInput-adornedEnd {
    padding-inline-end: 0;
    padding-inline-start: 0;
  }
  .MuiFormLabel-root {
    margin-block-end: 0.25rem;
    line-height: 1.2;
  }
  .MuiSvgIcon-root {
    font-size: 1rem;
  }
`;

interface DueDatePickerProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  disablePast?: boolean;
  fullWidth?: boolean;
  required?: boolean;
  label?: string;
  inputRef?: React.Ref<any>;
  invalid?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export const DueDatePicker = ({
  value,
  onChange,
  label,
  disablePast,
  fullWidth,
  required,
  inputRef,
  invalid,
  helperText,
  disabled,
}: DueDatePickerProps) => {
  const [date, setDate] = useState<string | null>(value ?? null);

  // update in local state to be the end of the selected date
  // this is also to handle invalid dates, so the filter doesn't get updated until a valid date is selected/entered
  const updateSelectedDate = (newValue: string | null) => {
    if (!newValue) return setDate('');
    if (!isValid(new Date(newValue))) return setDate('');
    const endOfDay = new Date(new Date(newValue).setHours(23, 59, 59, 999));

    // format the date to include timezone
    const newDate = format(endOfDay, `yyyy-MM-dd'T'HH:mm:ss.SSSXXX`);

    setDate(newDate);
  };

  // if the date is updated, update the value
  useEffect(() => {
    if (date === value) return;
    onChange(date);
  }, [date]);

  // if the value is updated, update the local state. This is to handle, for example, dates that are updated from the URL params
  useEffect(() => {
    if (value === date) return;

    setDate(value ?? '');
  }, [value]);

  const getLocaleDateFormat = () => {
    const localeCode = window.navigator.language;
    const parts = new Intl.DateTimeFormat(localeCode).formatToParts();
    return parts
      .map(({ type, value: partValue }) => {
        switch (type) {
          case 'year':
            return 'yyyy';
          case 'month':
            return 'mm';
          case 'day':
            return 'dd';
          default:
            return partValue;
        }
      })
      .join('');
  };

  const placeholder = getLocaleDateFormat();

  return (
    <Wrapper>
      <DatePicker
        value={date}
        onChange={updateSelectedDate}
        InputAdornmentProps={{
          position: 'end',
        }}
        placeholder={placeholder}
        label={label}
        disablePast={disablePast}
        fullWidth={fullWidth}
        required={required}
        inputRef={inputRef}
        error={invalid}
        helperText={helperText}
        disabled={disabled}
        format="P"
      />
    </Wrapper>
  );
};
