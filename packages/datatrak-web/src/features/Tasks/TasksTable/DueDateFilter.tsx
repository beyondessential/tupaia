/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import { format, isValid } from 'date-fns';
import styled from 'styled-components';
import { DatePicker } from '@tupaia/ui-components';

const Wrapper = styled.div`
  .MuiButtonBase-root.MuiIconButton-root {
    color: ${props => props.theme.palette.primary.main};
  }
  .MuiInputBase-input {
    padding-inline-end: 0;
  }
  .MuiInputAdornment-positionEnd {
    margin-inline-start: 0;
  }
  .MuiOutlinedInput-adornedEnd {
    padding-inline-end: 0;
  }
`;

const DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss';

interface DueDateFilterProps {
  filter: { value: string } | undefined;
  onChange: (value: string | null) => void;
}

export const DueDateFilter = ({ filter, onChange }: DueDateFilterProps) => {
  const [date, setDate] = useState<string | null>(filter?.value ?? null);

  // update in local state to be the end of the selected date
  // this is also to handle invalid dates, so the filter doesn't get updated until a valid date is selected/entered
  const updateSelectedDate = (value: string | null) => {
    if (!value) return setDate(null);
    if (!isValid(new Date(value))) return;
    const endOfDay = new Date(value).setHours(23, 59, 59, 999);
    const newDate = format(endOfDay, DATE_FORMAT);
    setDate(newDate);
  };

  // if the date is updated, update the filter
  useEffect(() => {
    if (date === filter?.value) return;
    onChange(date);
  }, [date]);

  // if the filter is updated, update the local state. This is to handle, for example, dates that are updated from the URL params
  useEffect(() => {
    if (filter?.value === date) return;

    setDate(filter?.value ?? null);
  }, [filter?.value]);

  const getLocaleDateFormat = () => {
    const localeCode = window.navigator.language;
    const parts = new Intl.DateTimeFormat(localeCode).formatToParts();
    return parts
      .map(({ type, value }) => {
        switch (type) {
          case 'year':
            return 'yyyy';
          case 'month':
            return 'mm';
          case 'day':
            return 'dd';
          default:
            return value;
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
      />
    </Wrapper>
  );
};
