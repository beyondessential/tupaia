/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import DateFnsUtils from '@date-io/date-fns';
import PropTypes from 'prop-types';
import { KeyboardDatePicker as MuiDatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import { TextField } from './TextField';

const StyledDatePicker = styled(MuiDatePicker)`
  .MuiInputAdornment-positionEnd :before {
    padding-right: 10px;
  }
`;

export const DatePicker = props => {
  const [value, setValue] = useState(new Date());

  const handleChange = useCallback(
    date => {
      setValue(date);
    },
    [setValue],
  );

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <StyledDatePicker
        value={value}
        format="dd/MM/yyyy"
        onChange={handleChange}
        animateYearScrolling
        TextFieldComponent={TextField}
        {...props}
      />
    </MuiPickersUtilsProvider>
  );
};

DatePicker.propTypes = {
  label: PropTypes.string.isRequired,
};
