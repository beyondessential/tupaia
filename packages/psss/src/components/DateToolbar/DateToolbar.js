/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import {
  format,
  getISOWeek,
  endOfISOWeek,
  startOfISOWeek,
  addWeeks,
  subWeeks,
  isAfter,
  isBefore,
} from 'date-fns';
import styled from 'styled-components';
import { BaseToolbar, LightIconButton, SmallButton } from '@tupaia/ui-components';
import { FlexStart, FlexEnd, FlexSpaceBetween } from '../Layout';
import { WeekPicker } from './WeekPicker';
import { MIN_DATE } from './constants';

const Container = styled(FlexSpaceBetween)`
  width: 66%;
  height: 100%;
  padding-right: 1.8rem;
`;

const TodayButton = styled(SmallButton)`
  background-color: rgba(0, 0, 0, 0.15);
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.25);
    color: rgba(255, 255, 255, 0.95);
    box-shadow: none;
  }
`;

const ArrowButton = styled(LightIconButton)`
  &.MuiButtonBase-root {
    margin: 0;
  }
`;

const CalendarButton = styled(LightIconButton)`
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 3px;
  margin-right: 0.6rem;
  padding-top: 0.6rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.25);
  }

  .MuiSvgIcon-root {
    font-size: 1.3rem;
  }
`;

const Dot = styled.span`
  position: relative;
  line-height: 1rem;
  top: 0.25rem;
  font-size: 2.1rem;
  margin: 0 0.4rem 0 0.2rem;
`;

const Text = styled(Typography)`
  font-weight: 400;
  margin-right: 1.5rem;
`;

const MediumText = styled.span`
  font-weight: 500;
`;

export const DateToolbar = () => {
  const now = new Date();
  /* Value is always the start of the isoWeek */
  const [value, setValue] = useState(startOfISOWeek(now));
  const [isOpen, setIsOpen] = useState(false);

  const setCurrentWeek = () => {
    setValue(startOfISOWeek(now));
  };

  const increaseWeek = () => {
    setValue(date => addWeeks(date, 1));
  };

  const decreaseWeek = () => {
    setValue(date => subWeeks(date, 1));
  };

  const start = format(value, 'MMM d');
  const end = format(endOfISOWeek(value), 'MMM d , yyyy');
  const isNextDisabled = isAfter(addWeeks(value, 1), now);
  const isPrevDisabled = isBefore(addWeeks(value, 1), MIN_DATE);

  return (
    <BaseToolbar>
      <Container>
        <FlexStart>
          <CalendarButton onClick={() => setIsOpen(true)}>
            <CalendarTodayIcon />
          </CalendarButton>
          <WeekPicker
            label="Date"
            onChange={date => setValue(startOfISOWeek(date))}
            value={value}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
          <Text variant="h5">
            <MediumText>
              Week {getISOWeek(value)} <Dot>&#183;</Dot>
            </MediumText>
            {start} &#8211; {end}
          </Text>
        </FlexStart>
        <FlexEnd>
          <ArrowButton onClick={decreaseWeek} disabled={isPrevDisabled}>
            <ChevronLeftIcon />
          </ArrowButton>
          <TodayButton onClick={setCurrentWeek}>This week</TodayButton>
          <ArrowButton onClick={increaseWeek} disabled={isNextDisabled}>
            <ChevronRightIcon />
          </ArrowButton>
        </FlexEnd>
      </Container>
    </BaseToolbar>
  );
};
