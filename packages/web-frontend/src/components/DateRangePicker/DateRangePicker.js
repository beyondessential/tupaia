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
import { FlexEnd } from '@tupaia/ui-components/src/components/Layout/Flexbox';
import MuiIconButton from '@material-ui/core/IconButton';
import styled from 'styled-components';
import { Error } from '../Error';
import DatePickerDialog from './DatePickerDialog';
import {
  DEFAULT_MIN_DATE,
  momentToDateString,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  GRANULARITY_SHAPE,
  roundStartEndDates,
  constrainDate,
} from '../../utils/periodGranularities';
import { FlexStart, FlexSpaceBetween } from '../Flexbox';
import { DARK_GREY, PRIMARY_BLUE } from '../../styles';

const IconButton = styled(MuiIconButton)`
  margin-left: -2px;
  padding: 0;
  color: white;
  transition: color 0.2s ease;

  .MuiSvgIcon-root {
    font-size: 20px;
  }

  &:hover {
    background-color: initial;
    color: ${PRIMARY_BLUE};
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
    color: ${PRIMARY_BLUE};
  }
`;

const Label = styled(Typography)`
  margin-left: 0.5rem;
  color: white;
  font-size: 14px;
  line-height: 16px;
`;

const LabelContainer = styled(FlexEnd)`
  align-items: end;
`;

const ResetLabel = styled(Link)`
  color: ${DARK_GREY};
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

  const formattedStartDate = momentToDateString(startDate, granularity, rangeFormat);
  const formattedEndDate = momentToDateString(endDate, granularity, rangeFormat);

  return isSingleDate ? formattedEndDate : `${formattedStartDate} - ${formattedEndDate}`;
};

export const DateRangePicker = ({
  startDate,
  endDate,
  min,
  max,
  granularity,
  onSetDates,
  isLoading,
  align,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialStartDate] = useState(startDate);
  const [initialEndDate] = useState(endDate);

  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(granularity);
  const { momentShorthand } = GRANULARITY_CONFIG[granularity];

  const minMomentDate = min ? moment(min) : moment(DEFAULT_MIN_DATE);
  const maxMomentDate = max ? moment(max) : moment();

  let defaultStartDate;
  let defaultEndDate;
  if (isSingleDate) {
    defaultStartDate = constrainDate(moment(), minMomentDate, maxMomentDate);
    defaultEndDate = defaultStartDate; // end date is the same, but gets rounded to the period below
  } else {
    defaultStartDate = minMomentDate;
    defaultEndDate = maxMomentDate;
  }
  const roundedDefaults = roundStartEndDates(granularity, defaultStartDate, defaultEndDate);
  defaultStartDate = roundedDefaults.startDate;
  defaultEndDate = roundedDefaults.endDate;

  let currentStartDate = startDate ? moment(startDate) : defaultStartDate;
  let currentEndDate = endDate ? moment(endDate) : defaultEndDate;
  const roundedCurrent = roundStartEndDates(granularity, currentStartDate, currentEndDate);
  currentStartDate = roundedCurrent.startDate;
  currentEndDate = roundedCurrent.endDate;

  useEffect(() => {
    // Prevent set dates to the same dates
    if (!(initialStartDate && initialEndDate)) {
      onSetDates(currentStartDate, currentEndDate);
    }
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
    onSetDates(defaultStartDate, defaultEndDate);
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
        <div>
          <LabelContainer>
            <IconButton onClick={() => setIsOpen(true)} aria-label="open">
              <DateRangeIcon />
            </IconButton>
            <Label aria-label="active-date">{labelText}</Label>
          </LabelContainer>
          <ResetLabel component="button" onClick={handleReset}>
            Reset to default
          </ResetLabel>
        </div>
        {isSingleDate && (
          <FlexStart>
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
          </FlexStart>
        )}
      </FlexSpaceBetween>
      {/* Bug in Mui that doesn't unmount modal */}
      {isOpen && (
        <DatePickerDialog
          granularity={granularity}
          startDate={currentStartDate}
          endDate={currentEndDate}
          minMomentDate={minMomentDate}
          maxMomentDate={maxMomentDate}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSetNewDates={onSetDates}
        />
      )}
    </>
  );
};

const stringOrMoment = PropTypes.oneOfType([PropTypes.string, PropTypes.object]);

DateRangePicker.propTypes = {
  startDate: stringOrMoment,
  endDate: stringOrMoment,
  min: stringOrMoment,
  max: stringOrMoment,
  granularity: GRANULARITY_SHAPE,
  onSetDates: PropTypes.func,
  isLoading: PropTypes.bool,
  align: PropTypes.string,
};

DateRangePicker.defaultProps = {
  startDate: null,
  endDate: null,
  min: null,
  max: null,
  granularity: GRANULARITIES.DAY,
  onSetDates: () => {},
  isLoading: false,
  align: 'left',
};
