/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { DatePicker as DatePickerComponent } from '@tupaia/ui-components';
import { useVizConfig } from '../../context';

const DatePicker = styled(DatePickerComponent)`
  flex: 1 1 0px;
  margin: 0 15px 0 0;
  max-width: 30%;

  input.MuiInputBase-input.MuiOutlinedInput-input {
    font-size: 14px;
    line-height: 1;
    padding: 10px;
  }

  .MuiFormControl-root {
    margin: 0;
  }
`;

const StartDateField = () => {
  const [{ startDate, visualisation }, { setStartDate }] = useVizConfig();
  const defaultStartDate = visualisation?.latestDataParameters?.startDate;

  useEffect(() => {
    // Set the default start date if it exists and the start date is not set
    if (defaultStartDate && !startDate) {
      setStartDate(defaultStartDate);
    }
  }, [defaultStartDate, startDate]);

  const handleChangeStartDate = date => {
    const newDate = date ? date.toISOString() : null;
    setStartDate(newDate);
  };
  return (
    <DatePicker
      placeholder="Select start date"
      value={startDate}
      onChange={handleChangeStartDate}
    />
  );
};

const EndDateField = () => {
  const [{ endDate, visualisation }, { setEndDate }] = useVizConfig();
  const defaultEndDate = visualisation?.latestDataParameters?.endDate;

  useEffect(() => {
    // Set the default start date if it exists and the start date is not set
    if (defaultEndDate && !endDate) {
      setEndDate(defaultEndDate);
    }
  }, [defaultEndDate, endDate]);

  const handleChangeEndDate = date => {
    const newDate = date ? date.toISOString() : null;
    setEndDate(newDate);
  };
  return (
    <DatePicker placeholder="Select end date" value={endDate} onChange={handleChangeEndDate} />
  );
};

export const DateRangeField = () => {
  return (
    <>
      <StartDateField />
      <EndDateField />
    </>
  );
};
