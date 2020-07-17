/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';

import clsx from 'clsx';

import { CustomToolbar } from './CustomToolbar';

import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import format from 'date-fns/format';
import getISOWeek from 'date-fns/get_iso_week';
import startOfISOWeek from 'date-fns/start_of_iso_week';
import endOfISOWeek from 'date-fns/end_of_iso_week';
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

export const DateToolbarComponent = ({ classes }) => {
  const [value, setValue] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const renderWeekPickerDay = (date, selectedDate, dayInCurrentMonth) => {
    const start = startOfISOWeek(selectedDate);
    const end = endOfISOWeek(selectedDate);

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

  const start = format(startOfISOWeek(value), 'MMM d');
  const end = format(endOfISOWeek(value), 'MMM d , yyyy');

  return (
    <BaseToolbar>
      <Container>
        <FlexStart>
          <LightIconButton onClick={() => setIsOpen(true)}>
            <ExpandMoreIcon />
          </LightIconButton>
          <DatePicker
            label="Date"
            onChange={date => setValue(startOfISOWeek(date))}
            value={value}
            open={isOpen}
            onClose={() => setIsOpen(false)}
            TextFieldComponent={() => null}
            renderDay={renderWeekPickerDay}
            ToolbarComponent={CustomToolbar}
          />
          <Text variant="h5">
            Week {getISOWeek(value)} <span>&#183;</span> {start} - {end}
          </Text>
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
