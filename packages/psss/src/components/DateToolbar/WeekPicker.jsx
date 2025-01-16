import React from 'react';
import PropTypes from 'prop-types';
import { DatePicker } from '@tupaia/ui-components';
import isWithinInterval from 'date-fns/isWithinInterval';
import { startOfISOWeek, endOfISOWeek } from 'date-fns';
import isSameDay from 'date-fns/isSameDay';
import { IconButton, withStyles } from '@material-ui/core';
import format from 'date-fns/format';
import { createStyles } from '@material-ui/styles';
import { WeekPickerToolbar } from './WeekPickerToolbar';
import { MIN_DATE } from '../../constants';

/**
 * Customisation of the DatePicker is not easily possible using styled-components
 * so have had to use a createStyles solution
 */
const styles = createStyles(theme => ({
  dayWrapper: {
    position: 'relative',
  },
  day: {
    width: 36,
    height: 36,
    fontSize: theme.typography.caption.fontSize,
    margin: '0 2px',
    color: 'inherit',
  },
  customDayHighlight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '2px',
    right: '2px',
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: '50%',
  },
  nonCurrentMonthDay: {
    color: theme.palette.text.disabled,
  },
  highlightNonCurrentMonthDay: {
    color: '#676767',
  },
  highlight: {
    background: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  firstHighlight: {
    extend: 'highlight',
    borderTopLeftRadius: '50%',
    borderBottomLeftRadius: '50%',
  },
  endHighlight: {
    extend: 'highlight',
    borderTopRightRadius: '50%',
    borderBottomRightRadius: '50%',
  },
}));

/**
 * Custom week picker component which allows selecting of ISOWeeks
 * Customisation is based heavily on material-ui docs @See: https://material-ui-pickers.dev/demo/datepicker
 */
const WeekPickerComponent = ({ label, value, onChange, isOpen, onClose, classes }) => {
  const renderWeekPickerDay = (date, selectedDate, dayInCurrentMonth) => {
    const start = startOfISOWeek(selectedDate);
    const end = endOfISOWeek(selectedDate);

    const dayIsBetween = isWithinInterval(date, { start, end });
    const isFirstDay = isSameDay(date, start);
    const isLastDay = isSameDay(date, end);

    const wrapperClassName = [
      ...(dayIsBetween ? [classes.highlight] : []),
      ...(isFirstDay ? [classes.firstHighlight] : []),
      ...(isLastDay ? [classes.endHighlight] : []),
    ].join(' ');

    const dayClassName = [
      classes.day,
      ...(!dayInCurrentMonth ? [classes.nonCurrentMonthDay] : []),
      ...(!dayInCurrentMonth && dayIsBetween ? [classes.highlightNonCurrentMonthDay] : []),
    ].join(' ');

    return (
      <div className={wrapperClassName}>
        <IconButton className={dayClassName}>
          <span>{format(date, 'd')}</span>
        </IconButton>
      </div>
    );
  };
  return (
    <DatePicker
      label={label}
      onChange={onChange}
      value={value}
      open={isOpen}
      onClose={onClose}
      TextFieldComponent={() => null}
      renderDay={renderWeekPickerDay}
      ToolbarComponent={WeekPickerToolbar}
      disableFuture
      minDate={MIN_DATE}
    />
  );
};

WeekPickerComponent.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.instanceOf(Date).isRequired,
  onChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  classes: PropTypes.object.isRequired,
};

export const WeekPicker = withStyles(styles)(WeekPickerComponent);
