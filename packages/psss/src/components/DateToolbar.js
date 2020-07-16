/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';

import clsx from 'clsx';

import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import endOfWeek from 'date-fns/endOfWeek';
import format from 'date-fns/format';
import isValid from 'date-fns/isValid';
import startOfWeek from 'date-fns/startOfWeek';
import isWithinInterval from 'date-fns/isWithinInterval';
import isSameDay from 'date-fns/isSameDay';
import { createStyles } from '@material-ui/styles';
import { IconButton, withStyles } from '@material-ui/core';
import styled from 'styled-components';
import {
  LightOutlinedButton,
  BaseToolbar,
  LightIconButton,
  DatePicker,
} from '@tupaia/ui-components';
import { FlexStart, FlexEnd, FlexSpaceBetween } from './Layout';

const Container = styled(FlexSpaceBetween)`
  width: 66%;
  height: 100%;
  padding-right: 30px;
`;

const Text = styled(Typography)`
  margin-right: 1.5rem;
`;

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

export const DateToolbarComponent = props => {
  const [value, setValue] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const formatWeekSelectLabel = (date, invalidLabel) => {
    return `Week of ${format(startOfWeek(date), 'MMM do')}`;
  };

  const renderWeekPickerDay = (date, selectedDate, dayInCurrentMonth) => {
    const { classes } = props;
    const selectedDateClone = new Date(selectedDate.getTime());

    const start = startOfWeek(selectedDateClone);
    const end = endOfWeek(selectedDateClone);

    const dayIsBetween = isWithinInterval(date, { start, end });
    const isFirstDay = isSameDay(date, start);
    const isLastDay = isSameDay(date, end);

    const wrapperClassName = clsx({
      [classes.highlight]: dayIsBetween,
      [classes.firstHighlight]: isFirstDay,
      [classes.endHighlight]: isLastDay,
    });

    const dayClassName = clsx(classes.day, {
      [classes.nonCurrentMonthDay]: !dayInCurrentMonth,
      [classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && dayIsBetween,
    });

    return (
      <div className={wrapperClassName}>
        <IconButton className={dayClassName}>
          <span> {format(date, 'd')} </span>
        </IconButton>
      </div>
    );
  };

  const handleDateChange = date => {
    console.log('date change...', date);
    setValue({ selectedDate: startOfWeek(new Date(date.getTime())) });
  };

  return (
    <BaseToolbar>
      <Container>
        <FlexStart>
          <LightIconButton onClick={() => setIsOpen(true)}>
            <ExpandMoreIcon />
          </LightIconButton>
          <DatePicker
            label="Date"
            onChange={handleDateChange}
            value={value}
            open={isOpen}
            onClose={() => setIsOpen(false)}
            TextFieldComponent={() => null}
            renderDay={renderWeekPickerDay}
            labelFunc={formatWeekSelectLabel}
          />
          <Text variant="h5">Week 10 . Feb 25 2020 - Mar 1, 2020</Text>
        </FlexStart>
        <FlexEnd>
          <LightIconButton>
            <ChevronLeftIcon />
          </LightIconButton>
          <LightOutlinedButton>This Week</LightOutlinedButton>
          <LightIconButton>
            <ChevronRightIcon />
          </LightIconButton>
        </FlexEnd>
      </Container>
    </BaseToolbar>
  );
};

export const DateToolbar = withStyles(styles)(DateToolbarComponent);
