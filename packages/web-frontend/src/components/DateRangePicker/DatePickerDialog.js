/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import moment from 'moment';
import styled from 'styled-components';
import { DIALOG_Z_INDEX } from '../../styles';
import { Error } from '../Error';
import { DayPicker } from './DayPicker';
import { MonthPicker } from './MonthPicker';
import { YearPicker } from './YearPicker';
import { WeekPicker } from './WeekPicker';
import { QuarterPicker } from './QuarterPicker';
import {
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  roundStartEndDates,
} from '../../utils/periodGranularities';
import { DEFAULT_MIN_DATE } from './constants';

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

const StyledDateRow = styled.div`
  display: flex;
  margin-top: 30px;
`;

export const DatePickerDialog = ({
  isOpen,
  onClose,
  granularity,
  startDate,
  endDate,
  min,
  max,
  onSetNewDates,
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState(startDate);
  const [selectedEndDate, setSelectedEndDate] = useState(endDate);
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
    if (!startDate.isSame(roundedStartDate, 'day') || !endDate.isSame(roundedEndDate, 'day')) {
      // Update the external control values!
      onSetNewDates(roundedStartDate, roundedEndDate);
    }
    onClose();
    return setErrorMessage('');
  };

  const minMomentDate = min ? moment(min) : moment(DEFAULT_MIN_DATE);
  const maxMomentDate = max ? moment(max) : moment();

  return (
    <Dialog
      modal="true"
      open={isOpen}
      style={{ zIndex: DIALOG_Z_INDEX + 1 }}
      PaperProps={{ style: { width: '75%', maxWidth: '700px' } }}
    >
      <DialogTitle>{getLabelText(granularity)}</DialogTitle>
      <DialogContent>
        {!isSingleDate && (
          <StyledDateRow>
            <DateRow
              granularity={granularity}
              momentDateValue={selectedStartDate}
              minMomentDate={minMomentDate}
              maxMomentDate={maxMomentDate}
              onChange={setSelectedStartDate}
            />
          </StyledDateRow>
        )}
        <StyledDateRow>
          <DateRow
            granularity={granularity}
            momentDateValue={selectedEndDate}
            minMomentDate={minMomentDate}
            maxMomentDate={maxMomentDate}
            onChange={setSelectedEndDate}
          />
        </StyledDateRow>
        {errorMessage ? <Error>{errorMessage}</Error> : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancelDateSelection}>Cancel</Button>
        <Button color="primary" onClick={onSubmit} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};
