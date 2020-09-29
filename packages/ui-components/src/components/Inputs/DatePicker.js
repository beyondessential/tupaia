/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import DateFnsUtils from '@date-io/date-fns';
import PropTypes from 'prop-types';
import auLocale from 'date-fns/locale/en-AU';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import {
  KeyboardDatePicker as MuiDatePicker,
  KeyboardDateTimePicker as MuiDateTimePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { TextField } from './TextField';
import { DAY_MONTH_YEAR_DATE_FORMAT, AM_PM_DATE_FORMAT } from '../../constants';

const StyledDatePicker = styled(MuiDatePicker)`
  .MuiInputBase-input {
    padding-left: 0;
    color: ${props => props.theme.palette.text.secondary};
  }

  .MuiButtonBase-root.MuiIconButton-root {
    top: -1px;
    color: ${props => props.theme.palette.text.secondary};
    padding: 0.5rem;
  }
`;

export const DatePicker = ({ label, value, onChange, className, format, ...props }) => (
  <MuiPickersUtilsProvider utils={DateFnsUtils} locale={auLocale}>
    <StyledDatePicker
      label={label}
      value={value}
      format={format}
      keyboardIcon={<CalendarTodayIcon />}
      InputAdornmentProps={{ position: 'start' }}
      onChange={onChange}
      animateYearScrolling
      TextFieldComponent={TextField}
      className={className}
      {...props}
    />
  </MuiPickersUtilsProvider>
);

DatePicker.propTypes = {
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
  format: PropTypes.string,
};

DatePicker.defaultProps = {
  value: new Date(), // RHF controls controls it via defaultValue - ^
  onChange: () => null, // doesn't get called anyway; https://github.com/react-hook-form/react-hook-form/issues/438#issuecomment-633760140
  className: null,
  format: DAY_MONTH_YEAR_DATE_FORMAT,
};

export const DateTimePicker = ({ label, value, onChange, className, format, ...props }) => (
  <MuiPickersUtilsProvider utils={DateFnsUtils}>
    <StyledDatePicker
      as={MuiDateTimePicker}
      label={label}
      value={value}
      keyboardIcon={<CalendarTodayIcon />}
      InputAdornmentProps={{ position: 'start' }}
      format={format}
      onChange={onChange}
      animateYearScrolling
      TextFieldComponent={TextField}
      className={className}
      {...props}
    />
  </MuiPickersUtilsProvider>
);

DateTimePicker.propTypes = {
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  value: PropTypes.instanceOf(Date),
  onChange: PropTypes.func,
  format: PropTypes.string,
};

DateTimePicker.defaultProps = {
  value: new Date(), // RHF controls controls it via defaultValue - ^
  onChange: () => null, // doesn't get called anyway; https://github.com/react-hook-form/react-hook-form/issues/438#issuecomment-633760140
  className: null,
  format: `${DAY_MONTH_YEAR_DATE_FORMAT} ${AM_PM_DATE_FORMAT}`,
};
