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

  /**
   * When you select a date in the date picker (either with the interactive calendar or by inserting
   * a valid date string), the picker actually selects a specific moment in time on that date with
   * the normal, millisecond granularity of a Date object. The time of day it selects is the current
   * local time on the system where VizBuilder is running.
   *
   * When inputting the date, the date picker interprets it in the user’s time zone. Under the hood,
   * this is converted to UTC, which can cause the picked date to be different from what the user
   * input (±1 day).
   *
   * This helper function accounts for that discrepancy.
   *
   * @param date A valid date object
   * @returns {Date}
   */
  const shiftEpoch = date =>
    new Date(date.setMinutes(date.getMinutes() - date.getTimezoneOffset()));

  const convertDateToIsoString = date => {
    if (!date || Number.isNaN(new Date(date).getTime())) return null;
    const correctedDate = shiftEpoch(date);

    // Slice to discard timestamp, keeping only "yyyy-mm-dd"
    return correctedDate.toISOString().slice(0, 10);
  };

  const handleChangeStartDate = date => {
    const newDate = convertDateToIsoString(date);
    setStartDate(newDate);
  };

  const handleChangeEndDate = date => {
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
