/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useIsFetching } from '@tanstack/react-query';
import { comparePeriods } from '@tupaia/utils';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CalendarTodayIcon from '@material-ui/icons/CalendarToday';
import styled from 'styled-components';
import { LightIconButton, SmallButton } from '@tupaia/ui-components';
import { FlexStart, FlexEnd, FlexSpaceBetween } from '../Layout';
import { WeekPicker } from './WeekPicker';
import { MIN_DATE } from '../../constants';
import {
  getCurrentPeriod,
  getDateByPeriod,
  getPeriodByDate,
  addWeeksToPeriod,
  getFormattedStartByPeriod,
  getFormattedEndByPeriod,
  getWeekNumberByPeriod,
  subtractWeeksFromPeriod,
} from '../../utils';
import { getLatestViewableWeek, setLatestViewableWeek } from '../../store';
import { BaseToolbar } from '../Toolbar';

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
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

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

export const DateToolbarComponent = ({ period, setPeriod }) => {
  const isFetching = !!useIsFetching();
  const [isOpen, setIsOpen] = useState(false);
  const defaultPeriod = getCurrentPeriod();

  useEffect(() => {
    setCurrentWeek();
  }, []);

  const setCurrentWeek = () => {
    setPeriod(defaultPeriod);
  };

  const increaseWeek = () => {
    const newDate = addWeeksToPeriod(period, 1);
    setPeriod(newDate);
  };

  const decreaseWeek = () => {
    const newDate = subtractWeeksFromPeriod(period, 1);
    setPeriod(newDate);
  };

  const start = getFormattedStartByPeriod(period, 'MMM d');
  const end = getFormattedEndByPeriod(period, 'MMM d , yyyy');

  const isNextDisabled = comparePeriods(addWeeksToPeriod(period, 1), defaultPeriod) > 0;
  const isPrevDisabled =
    comparePeriods(subtractWeeksFromPeriod(period, 1), getPeriodByDate(MIN_DATE)) < 0;

  return (
    <BaseToolbar maxWidth="xl">
      <Container>
        <FlexStart>
          <CalendarButton onClick={() => setIsOpen(true)}>
            <CalendarTodayIcon />
          </CalendarButton>
          <WeekPicker
            label="Date"
            onChange={newDate => setPeriod(getPeriodByDate(newDate))}
            value={getDateByPeriod(period)}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
          />
          <Text variant="h5">
            <MediumText>
              Week {getWeekNumberByPeriod(period)} <Dot>&#183;</Dot>
            </MediumText>
            {start} &#8211; {end}
          </Text>
        </FlexStart>
        <FlexEnd>
          <ArrowButton onClick={decreaseWeek} disabled={isFetching || isPrevDisabled}>
            <ChevronLeftIcon />
          </ArrowButton>
          <StyledButton onClick={setCurrentWeek} disabled={isFetching}>
            This Week
          </StyledButton>
          <ArrowButton onClick={increaseWeek} disabled={isFetching || isNextDisabled}>
            <ChevronRightIcon />
          </ArrowButton>
        </FlexEnd>
      </Container>
    </BaseToolbar>
  );
};

DateToolbarComponent.propTypes = {
  period: PropTypes.string.isRequired,
  setPeriod: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({
  period: getLatestViewableWeek(state),
});

const mapDispatchToProps = dispatch => ({
  setPeriod: period => {
    dispatch(setLatestViewableWeek(period));
  },
});

export const DateToolbar = connect(mapStateToProps, mapDispatchToProps)(DateToolbarComponent);
