import React from 'react';
import styled from 'styled-components';
import DateFnsUtils from '@date-io/date-fns';
import * as locales from 'date-fns/locale';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import {
  KeyboardDatePicker as MuiDatePicker,
  KeyboardDatePickerProps,
  KeyboardDateTimePicker as MuiDateTimePicker,
  KeyboardDateTimePickerProps,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import { AM_PM_DATE_FORMAT, DAY_MONTH_YEAR_DATE_FORMAT } from '../../constants';
import { TextField } from './TextField';

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

/**
 * This is a workaround for an issue where the type of the TextFieldComponent prop in the datepickers does not accept a ElementType type. [More info is here]{@link https://github.com/mui/material-ui-pickers/issues/1165}
 */
const TextFieldComponent = (props: any) => <TextField {...props} />;

// So that the datepickers always show the correct locale, we need to pass a locale object to the MuiPickersUtilsProvider. To do this, we need to get the locale code from the browser and then find the corresponding locale object from the date-fns locales. If the locale code is not supported, we fallback to enAU.
const getLocale = () => {
  const localeCode = window.navigator.language.replace('-', '');
  return locales[localeCode as keyof typeof locales] || locales.enAU;
};

export const DatePicker = ({
  label,
  value = new Date(), // RHF controls controls it via defaultValue - ^,
  onChange = () => null, // doesn't get called anyway; https://github.com/react-hook-form/react-hook-form/issues/438#issuecomment-633760140,
  className,
  format = DAY_MONTH_YEAR_DATE_FORMAT,
  ...props
}: KeyboardDatePickerProps) => {
  const locale = getLocale();
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={locale}>
      <StyledDatePicker
        label={label}
        value={value}
        format={format}
        keyboardIcon={<CalendarTodayIcon />}
        InputAdornmentProps={{ position: 'start' }}
        onChange={onChange}
        TextFieldComponent={TextFieldComponent}
        className={className}
        KeyboardButtonProps={{
          title: 'Change date',
        }}
        {...props}
      />
    </MuiPickersUtilsProvider>
  );
};

export const DateTimePicker = ({
  label,
  value = new Date(), // RHF controls controls it via defaultValue - ^,
  onChange = () => null, // doesn't get called anyway; https://github.com/react-hook-form/react-hook-form/issues/438#issuecomment-633760140,
  className,
  format = `${DAY_MONTH_YEAR_DATE_FORMAT} ${AM_PM_DATE_FORMAT}`,
  ...props
}: KeyboardDateTimePickerProps) => {
  const locale = getLocale();
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={locale}>
      <StyledDatePicker
        as={MuiDateTimePicker}
        label={label}
        value={value}
        keyboardIcon={<CalendarTodayIcon />}
        InputAdornmentProps={{ position: 'start' }}
        format={format}
        onChange={onChange}
        TextFieldComponent={TextFieldComponent}
        className={className}
        {...props}
      />
    </MuiPickersUtilsProvider>
  );
};
