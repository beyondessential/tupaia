/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import DateFnsUtils from '@date-io/date-fns';
import { KeyboardDatePicker as MuiDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { TextField } from './TextField';

const StyledDatePicker = styled(MuiDatePicker)`
  .MuiInputAdornment-positionEnd :before {
    padding-right: 10px;
  }
`;

export const DatePicker = props => {
  const [selectedDate, handleDateChange] = useState(new Date());

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <StyledDatePicker
        label="Basic example"
        value={selectedDate}
        format="dd/MM/yyyy"
        onChange={date => handleDateChange(date)}
        animateYearScrolling
        TextFieldComponent={TextField}
        {...props}
      />
    </MuiPickersUtilsProvider>
  );
};
