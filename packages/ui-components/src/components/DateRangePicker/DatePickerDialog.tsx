/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React, { useState } from 'react';
import moment from 'moment';
import styled from 'styled-components';
import {
  DEFAULT_MIN_DATE,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_SHAPE,
  roundStartEndDates,
} from '@tupaia/utils';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '../Dialog';
import { DayPicker } from './DayPicker';
import { MonthPicker } from './MonthPicker';
import { YearPicker } from './YearPicker';
import { WeekPicker } from './WeekPicker';
import { QuarterPicker } from './QuarterPicker';
import { Button, OutlinedButton } from '../Button';
import { BaseDatePickerProps, WeekPickerProps, YearPickerProps } from '../../types';

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

const Container = styled.div`
  display: flex;
  margin-top: 1rem;

  .MuiFormControl-root {
    margin-right: 1rem;
    &:last-child {
      margin-right: 0;
    }
  }
  .MuiSelect-root {
    color: ${props => props.theme.palette.text.primary};
    &:focus {
      background-color: transparent;
    }
  }
  .MuiInputBase-root {
    background-color: transparent;
  }
`;

type DateRowProps = (BaseDatePickerProps | YearPickerProps | WeekPickerProps) & {
  granularity: typeof GRANULARITY_SHAPE;
};
const DateRow = ({ granularity, ...props }: DateRowProps) => {
  switch (granularity) {
    default:
    case DAY:
      return (
        <Container>
          <DayPicker {...props} />
          <MonthPicker {...props} />
          <YearPicker {...(props as YearPickerProps)} />
        </Container>
      );
    case SINGLE_WEEK:
    case WEEK:
      return (
        <Container>
          <WeekPicker {...props} />
          <YearPicker {...(props as YearPickerProps)} isIsoYear />
        </Container>
      );
    case MONTH:
    case SINGLE_MONTH:
      return (
        <Container>
          <MonthPicker {...props} />
          <YearPicker {...(props as YearPickerProps)} />
        </Container>
      );
    case QUARTER:
    case SINGLE_QUARTER:
      return (
        <Container>
          <QuarterPicker {...props} />
          <YearPicker {...(props as YearPickerProps)} />
        </Container>
      );
    case YEAR:
    case SINGLE_YEAR:
      return (
        <Container>
          <YearPicker {...(props as YearPickerProps)} />
        </Container>
      );
  }
};

const getLabelText = (granularity: string) => {
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

const Error = styled.div`
  color: ${props => props.theme.palette.error.main};
  font-size: 0.75rem;
  margin-top: 0.3rem;
`;

const StyledDialogContent = styled(DialogContent)`
  text-align: left;
  padding-top: 1.5rem;
`;

type DatePickerDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  granularity: typeof GRANULARITY_SHAPE;
  startDate: string;
  endDate: string;
  minDate?: string;
  maxDate?: string;
  onSetNewDates: (startDate: string, endDate: string) => void;
  weekDisplayFormat?: string;
};

export const DatePickerDialog = ({
  isOpen,
  onClose,
  granularity,
  startDate,
  endDate,
  minDate,
  maxDate,
  onSetNewDates,
  weekDisplayFormat,
}: DatePickerDialogProps) => {
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
    // reset the date values to the original values
    setSelectedStartDate(momentStartDate);
    setSelectedEndDate(momentEndDate);
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
    <Dialog open={isOpen} maxWidth="sm" id="date-picker-dialog">
      <DialogHeader title={getLabelText(granularity)} onClose={onCancelDateSelection} />
      <StyledDialogContent>
        {!isSingleDate && (
          <DateRow
            granularity={granularity}
            momentDateValue={selectedStartDate}
            minMomentDate={minMomentDate}
            maxMomentDate={maxMomentDate}
            onChange={setSelectedStartDate}
            weekDisplayFormat={weekDisplayFormat}
          />
        )}
        <DateRow
          granularity={granularity}
          momentDateValue={selectedEndDate}
          minMomentDate={minMomentDate}
          maxMomentDate={maxMomentDate}
          onChange={setSelectedEndDate}
          weekDisplayFormat={weekDisplayFormat}
        />
        {errorMessage ? <Error>{errorMessage}</Error> : null}
      </StyledDialogContent>
      <DialogFooter>
        <OutlinedButton onClick={onCancelDateSelection}>Cancel</OutlinedButton>
        <Button color="primary" onClick={onSubmit} variant="contained">
          Submit
        </Button>
      </DialogFooter>
    </Dialog>
  );
};
