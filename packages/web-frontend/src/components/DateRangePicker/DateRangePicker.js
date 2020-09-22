/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import DateRangeIcon from '@material-ui/icons/DateRange';
import KeyboardArrowLeftIcon from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import MuiIconButton from '@material-ui/core/IconButton';
import styled from 'styled-components';
import { Error } from '../Error';
import { DatePickerDialog } from './DatePickerDialog';
import {
  formatMomentAsString,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  GRANULARITY_SHAPE,
  roundStartEndDates,
} from '../../utils/periodGranularities';
import { MIN_DATE_PICKER_DATE } from './constants';

const FlexRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const FlexSpaceBetween = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const hoverBlue = '#2196f3';

const IconButton = styled(MuiIconButton)`
  color: white;
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
  color: white;
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
  color: white;
  font-size: 16px;
  line-height: 19px;
`;

const LabelContainer = styled.div`
  border-left: 1px solid rgba(255, 255, 255, 0.5);
  padding-left: 12px;
  padding-right: 10px;
`;

const ResetLabel = styled(Link)`
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  line-height: 14px;
  margin-top: 3px;

  &:hover {
    color: white;
  }
`;

const DEFAULT_GRANULARITY = GRANULARITY_CONFIG[GRANULARITIES.DAY];

const getDatesAsString = (isSingleDate, granularity, startDate, endDate) => {
  const { rangeFormat } = GRANULARITY_CONFIG[granularity] || DEFAULT_GRANULARITY;

  const formattedStartDate = formatMomentAsString(startDate, granularity, rangeFormat);
  const formattedEndDate = formatMomentAsString(endDate, granularity, rangeFormat);

  return isSingleDate ? formattedEndDate : `${formattedStartDate} - ${formattedEndDate}`;
};

export const DateRangePicker = ({
  startDate,
  endDate,
  granularity,
  onSetDates,
  isLoading,
  align,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialStartDate, setInitialStartDate] = useState(startDate);
  const [initialEndDate, setInitialEndDate] = useState(endDate);

  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(granularity);
  const { momentShorthand } = GRANULARITY_CONFIG[granularity];

  const minMomentDate = moment(MIN_DATE_PICKER_DATE);
  const maxMomentDate = moment();

  const defaultStartDate = isSingleDate ? moment() : minMomentDate;
  const defaultEndDate = isSingleDate ? defaultStartDate : maxMomentDate;

  const currentStartDate = startDate ? moment(startDate) : defaultStartDate;
  const currentEndDate = endDate ? moment(endDate) : defaultEndDate;

  const { startDate: roundedCurrentStartDate, endDate: roundedCurrentEndDate } = roundStartEndDates(
    granularity,
    currentStartDate,
    currentEndDate,
  );

  useEffect(() => {
    onSetDates(roundedCurrentStartDate, roundedCurrentEndDate);
  }, []);

  // Number of periods to move may be negative if changing to the previous period
  const changePeriod = numberOfPeriodsToMove => {
    if (!isSingleDate) {
      throw new Error('Can only change period for single unit date pickers (e.g. one month)');
    }

    const newStartDate = currentStartDate.clone().add(numberOfPeriodsToMove, momentShorthand);
    const newEndDate = currentEndDate.clone().add(numberOfPeriodsToMove, momentShorthand);

    const { startDate: roundedStartDate, endDate: roundedEndDate } = roundStartEndDates(
      granularity,
      newStartDate,
      newEndDate,
    );

    onSetDates(roundedStartDate, roundedEndDate);
  };

  const handleReset = () => {
    const resetStartDate = initialStartDate ? moment(initialStartDate) : defaultStartDate;
    const resetEndDate = initialEndDate ? moment(initialEndDate) : defaultEndDate;

    onSetDates(resetStartDate, resetEndDate);
  };

  const nextDisabled = currentEndDate.isSameOrAfter(maxMomentDate);
  const prevDisabled = currentStartDate.isSameOrBefore(minMomentDate);
  const labelText = getDatesAsString(isSingleDate, granularity, currentStartDate, currentEndDate);

  return (
    <>
      <FlexSpaceBetween>
        {isSingleDate && align === 'center' && (
          <ArrowButton
            type="button"
            aria-label="prev"
            onClick={() => changePeriod(-1)}
            disabled={isLoading || prevDisabled}
          >
            <KeyboardArrowLeftIcon />
          </ArrowButton>
        )}
        <FlexRow>
          <IconButton onClick={() => setIsOpen(true)} aria-label="open">
            <DateRangeIcon />
          </IconButton>
          <LabelContainer>
            <Label aria-label="active-date">{labelText}</Label>
            <ResetLabel component="button" onClick={handleReset}>
              Reset to default
            </ResetLabel>
          </LabelContainer>
        </FlexRow>
        {isSingleDate && (
          <FlexRow>
            {align === 'left' && (
              <ArrowButton
                type="button"
                aria-label="prev"
                onClick={() => changePeriod(-1)}
                disabled={isLoading || prevDisabled}
              >
                <KeyboardArrowLeftIcon />
              </ArrowButton>
            )}
            <ArrowButton
              type="button"
              aria-label="next"
              onClick={() => changePeriod(1)}
              disabled={isLoading || nextDisabled}
            >
              <KeyboardArrowRightIcon />
            </ArrowButton>
          </FlexRow>
        )}
      </FlexSpaceBetween>
      {/* Bug in Mui that doesn't unmount modal */}
      {isOpen && (
        <DatePickerDialog
          granularity={granularity}
          startDate={currentStartDate}
          endDate={currentEndDate}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSetNewDates={onSetDates}
        />
      )}
    </>
  );
};

DateRangePicker.propTypes = {
  startDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  endDate: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  granularity: GRANULARITY_SHAPE,
  onSetDates: PropTypes.func,
  isLoading: PropTypes.bool,
  align: PropTypes.string,
};

DateRangePicker.defaultProps = {
  startDate: null,
  endDate: null,
  granularity: GRANULARITIES.DAY,
  onSetDates: () => {},
  isLoading: false,
  align: 'left',
};
