/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '../Dialog';
import { DayPicker } from './DayPicker';
import { MonthPicker } from './MonthPicker';
import { YearPicker } from './YearPicker';
import { WeekPicker } from './WeekPicker';
import { QuarterPicker } from './QuarterPicker';
import { Button, OutlinedButton } from '../Button';
import {
  DEFAULT_MIN_DATE,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_SHAPE,
  roundStartEndDates,
} from '../Chart';

const {
  DAY,
  WEEK,
  SINGLE_WEEK,
  MONTH,
  SINGLE_MONTH,
  QUARTER,
  SINGLE_QUARTER,
  YEAR,
  SINGLE_YEAR,
} = GRANULARITIES;

const DateRow = ({ granularity, ...props }) => {
  switch (granularity) {
    default:
    case DAY:
      return (
        <>
          <DayPicker {...props} />
          <MonthPicker {...props} />
          <YearPicker {...props} />
        </>
      );
    case SINGLE_WEEK:
    case WEEK:
      return (
        <>
          <WeekPicker {...props} />
          <YearPicker {...props} isIsoYear />
        </>
      );
    case MONTH:
    case SINGLE_MONTH:
      return (
        <>
          <MonthPicker {...props} />
          <YearPicker {...props} />
        </>
      );
    case QUARTER:
    case SINGLE_QUARTER:
      return (
        <>
          <QuarterPicker {...props} />
          <YearPicker {...props} />
        </>
      );
    case YEAR:
    case SINGLE_YEAR:
      return <YearPicker {...props} />;
  }
};

DateRow.propTypes = {
  granularity: GRANULARITY_SHAPE.isRequired,
};

const getLabelText = granularity => {
  switch (granularity) {
    default:
      return 'Select Dates';
    case SINGLE_WEEK:
      return 'Select Week';
    case SINGLE_MONTH:
      return 'Select Month';
    case SINGLE_YEAR:
      return 'Select Year';
  }
};

export const Error = styled.div`
  color: ${props => props.theme.palette.error.main};
  font-size: 0.75rem;
  margin-top: 0.3rem;
`;

export const DatePickerDialog = ({
  isOpen,
  onClose,
  granularity,
  startDate,
  endDate,
  minDate,
  maxDate,
  onSetNewDates,
}) => {
  const momentStartDate = moment(startDate);
  const momentEndDate = moment(endDate);
  const minMomentDate = minDate ? moment(minDate) : moment(DEFAULT_MIN_DATE);
  const maxMomentDate = maxDate ? moment(maxDate) : moment();

  const [selectedStartDate, setSelectedStartDate] = useState(momentStartDate);
  const [selectedEndDate, setSelectedEndDate] = useState(momentEndDate);
  const [errorMessage, setErrorMessage] = useState('');
  const isSingleDate = GRANULARITIES_WITH_ONE_DATE.includes(granularity);

  const onCancelDateSelection = () => {
    onClose();
    setErrorMessage('');
  };

  const onSubmit = () => {
    if (!isSingleDate && selectedStartDate.isAfter(selectedEndDate)) {
      return setErrorMessage('Start date must be before end date');
    }

    const { startDate: roundedStartDate, endDate: roundedEndDate } = roundStartEndDates(
      granularity,
      isSingleDate ? selectedEndDate.clone() : selectedStartDate,
      selectedEndDate,
    );

    // Only update if the dates have actually changed by at least one day
    if (
      !momentStartDate.isSame(roundedStartDate, 'day') ||
      !momentEndDate.isSame(roundedEndDate, 'day')
    ) {
      // Update the external control values!
      onSetNewDates(roundedStartDate, roundedEndDate);
    }
    onClose();
    return setErrorMessage('');
  };

  return (
    <Dialog modal="true" open={isOpen} PaperProps={{ style: { width: '75%', maxWidth: '700px' } }}>
      <DialogHeader title={getLabelText(granularity)} onClose={onCancelDateSelection} />
      <DialogContent>
        {!isSingleDate && (
          <MuiBox display="flex" mt={3}>
            <DateRow
              granularity={granularity}
              momentDateValue={selectedStartDate}
              minMomentDate={minMomentDate}
              maxMomentDate={maxMomentDate}
              onChange={setSelectedStartDate}
            />
          </MuiBox>
        )}
        <MuiBox display="flex" mt={3}>
          <DateRow
            granularity={granularity}
            momentDateValue={selectedEndDate}
            minMomentDate={minMomentDate}
            maxMomentDate={maxMomentDate}
            onChange={setSelectedEndDate}
          />
        </MuiBox>
        {errorMessage ? <Error>{errorMessage}</Error> : null}
      </DialogContent>
      <DialogFooter>
        <OutlinedButton onClick={onCancelDateSelection}>Cancel</OutlinedButton>
        <Button color="primary" onClick={onSubmit} variant="contained">
          Submit
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

DatePickerDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  granularity: GRANULARITY_SHAPE.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  onSetNewDates: PropTypes.func.isRequired,
  minDate: PropTypes.string,
  maxDate: PropTypes.string,
};

DatePickerDialog.defaultProps = {
  minDate: null,
  maxDate: null,
};
