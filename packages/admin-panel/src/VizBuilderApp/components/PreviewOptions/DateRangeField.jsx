/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { DatePicker as DatePickerComponent } from '@tupaia/ui-components';
import { useVizConfigContext } from '../../context';

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

export const DateRangeField = () => {
  const [{ startDate, endDate, visualisation }, { setStartDate, setEndDate }] =
    useVizConfigContext();
  const defaultStartDate = visualisation?.latestDataParameters?.startDate;
  const defaultEndDate = visualisation?.latestDataParameters?.endDate;

  useEffect(() => {
    // Set the default start date if it exists and the start date is not set
    if (defaultStartDate && !startDate) {
      setStartDate(defaultStartDate);
    }
    // Set the default end date if it exists and the end date is not set
    if (defaultEndDate && !endDate) {
      setEndDate(defaultEndDate);
    }
  }, [defaultStartDate, startDate, defaultEndDate, endDate]);

  const convertDateToIsoString = date =>
    !date || isNaN(new Date(date).getTime()) ? null : date.toISOString().slice(0, 10);
  const shiftEpoch = date => date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

  const handleChangeStartDate = date => {
    shiftEpoch(date);
    const newDate = convertDateToIsoString(date);
    setStartDate(newDate);
  };

  const handleChangeEndDate = date => {
    shiftEpoch(date);
    const newDate = convertDateToIsoString(date);
    setEndDate(newDate);
  };
  return (
    <>
      <DatePicker
        placeholder="Select start date"
        value={startDate}
        onChange={handleChangeStartDate}
      />
      <DatePicker placeholder="Select end date" value={endDate} onChange={handleChangeEndDate} />
    </>
  );
};
