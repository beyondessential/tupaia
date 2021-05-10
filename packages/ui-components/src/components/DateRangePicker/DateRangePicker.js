/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import DateRangeIcon from '@material-ui/icons/DateRange';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import CircularProgress from '@material-ui/core/CircularProgress';
import MuiIconButton from '@material-ui/core/IconButton';
import { DatePickerDialog } from './DatePickerDialog';
import { FlexSpaceBetween, FlexStart } from '../Layout';
import { GRANULARITIES, GRANULARITY_SHAPE } from '../Chart';
import { useDateRangePicker } from './useDateRangePicker';

const hoverBlue = '#2196f3';

const IconButton = styled(MuiIconButton)`
  //color: white;
  transition: color 0.2s ease;

  .MuiSvgIcon-root {
    font-size: 22px;
  }

  &:hover {
    background-color: initial;
    color: ${hoverBlue};
  }
`;

const ArrowButton = styled(MuiIconButton)`
  //color: white;
  border-radius: 3px;
  padding: 0;
  background: rgba(0, 0, 0, 0.2);
  margin-left: 5px;
  transition: color 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.2);
    color: ${hoverBlue};
  }
`;

const Label = styled(Typography)`
  //color: white;
  font-size: 16px;
  line-height: 19px;
`;

const LabelContainer = styled.div`
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  padding-left: 12px;
  padding-right: 10px;
`;

const ResetLabel = styled(Link)`
  //color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  line-height: 14px;
  margin-top: 3px;

  //&:hover {
  //  color: white;
  //}
`;

export const DateRangePicker = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  granularity,
  onSetDates,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    isSingleDate,
    currentStartDate,
    currentEndDate,
    handleDateChange,
    handleReset,
    changePeriod,
    nextDisabled,
    prevDisabled,
    labelText,
  } = useDateRangePicker({
    startDate,
    endDate,
    minDate,
    maxDate,
    granularity,
    onSetDates,
  });

  return (
    <>
      <FlexSpaceBetween>
        <ArrowButton
          type="button"
          aria-label="prev"
          onClick={() => changePeriod(-1)}
          disabled={isLoading || prevDisabled}
        >
          <KeyboardArrowLeftIcon />
        </ArrowButton>
        <FlexStart>
          <IconButton onClick={() => setIsOpen(true)} aria-label="open">
            {isLoading ? <CircularProgress size={21} /> : <DateRangeIcon />}
          </IconButton>
          <LabelContainer>
            <Label aria-label="active-date">{labelText}</Label>
            <ResetLabel component="button" onClick={handleReset}>
              Reset to default
            </ResetLabel>
          </LabelContainer>
        </FlexStart>
        {isSingleDate && (
          <FlexStart>
            <ArrowButton
              type="button"
              aria-label="next"
              onClick={() => changePeriod(1)}
              disabled={isLoading || nextDisabled}
            >
              <KeyboardArrowRightIcon />
            </ArrowButton>
          </FlexStart>
        )}
      </FlexSpaceBetween>
      {/* Bug in Mui that doesn't unmount modal */}
      {isOpen && (
        <DatePickerDialog
          granularity={granularity}
          startDate={currentStartDate}
          endDate={currentEndDate}
          minDate={minDate}
          maxDate={maxDate}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSetNewDates={handleDateChange}
        />
      )}
    </>
  );
};

DateRangePicker.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
  granularity: GRANULARITY_SHAPE,
  onSetDates: PropTypes.func,
  isLoading: PropTypes.bool,
};

DateRangePicker.defaultProps = {
  startDate: null,
  endDate: null,
  minDate: null,
  maxDate: null,
  granularity: GRANULARITIES.DAY,
  onSetDates: () => {},
  isLoading: false,
};
