/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIsFetching } from 'react-query';
import { connect } from 'react-redux';
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
import { getDateByPeriod, getPeriodByDate } from '../../utils';
import { getLatestViewableWeek, setLatestViewableWeek } from '../../store';

const Container = styled(FlexSpaceBetween)`
  width: 66%;
  height: 100%;
  padding-right: 1.8rem;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const StyledButton = styled(SmallButton)`
  background-color: rgba(0, 0, 0, 0.15);
  color: rgba(255, 255, 255, 0.8);
  transition: color 0.2s ease, background-color 0.2s ease;

  &.Mui-disabled {
    opacity: 0.8;
    background-color: rgba(0, 0, 0, 0.15);
    color: rgba(255, 255, 255, 0.6);
  }

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

export const DateToolbarComponent = ({ date, setPeriod }) => {
  const isFetching = useIsFetching();
  const [isOpen, setIsOpen] = useState(false);
  const now = new Date();

  useEffect(() => {
    setCurrentWeek();
  }, []);

  const setCurrentWeek = () => {
    setPeriod(now);
  };

  const increaseWeek = () => {
    const newDate = addWeeks(date, 1);
    setPeriod(newDate);
  };

  const decreaseWeek = () => {
    const newDate = subWeeks(date, 1);
    setPeriod(newDate);
  };

  const start = format(date, 'MMM d');
  const end = format(endOfISOWeek(date), 'MMM d , yyyy');
  const isNextDisabled = isAfter(addWeeks(date, 1), now);
  const isPrevDisabled = isBefore(addWeeks(date, 1), MIN_DATE);

  return (
    <BaseToolbar>
      <Container>
        <FlexStart>
          <CalendarButton onClick={() => setIsOpen(true)}>
            <CalendarTodayIcon />
          </CalendarButton>
          <WeekPicker
            label="Date"
            onChange={week => setPeriod(startOfISOWeek(week))}
            value={date}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
          <Text variant="h5">
            <MediumText>
              Week {getISOWeek(date)} <Dot>&#183;</Dot>
            </MediumText>
            {start} &#8211; {end}
          </Text>
        </FlexStart>
        <FlexEnd>
          <ArrowButton onClick={decreaseWeek} disabled={!!isFetching || isPrevDisabled}>
            <ChevronLeftIcon />
          </ArrowButton>
          <StyledButton onClick={setCurrentWeek} disabled={!!isFetching}>
            This Week
          </StyledButton>
          <ArrowButton onClick={increaseWeek} disabled={!!isFetching || isNextDisabled}>
            <ChevronRightIcon />
          </ArrowButton>
        </FlexEnd>
      </Container>
    </BaseToolbar>
  );
};

DateToolbarComponent.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  setPeriod: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const period = getLatestViewableWeek(state);
  const date = getDateByPeriod(period);
  return {
    date,
  };
};

const mapDispatchToProps = dispatch => ({
  setPeriod: date => {
    const period = getPeriodByDate(date);
    dispatch(setLatestViewableWeek(period));
  },
});

export const DateToolbar = connect(mapStateToProps, mapDispatchToProps)(DateToolbarComponent);
