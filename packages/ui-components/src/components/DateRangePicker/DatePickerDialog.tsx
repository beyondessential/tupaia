/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React, { useEffect, useState } from 'react';
import moment, { Moment } from 'moment';
import styled from 'styled-components';
import { DialogProps, Typography } from '@material-ui/core';
import { DatePickerOffsetSpec } from '@tupaia/types';
import {
  DEFAULT_MIN_DATE,
  GRANULARITIES,
  GRANULARITIES_WITH_ONE_DATE,
  GRANULARITY_CONFIG,
  GRANULARITY_SHAPE,
  roundStartDate,
} from '@tupaia/utils';
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '../Dialog';
import { DayPicker } from './DayPicker';
import { MonthPicker } from './MonthPicker';
import { YearPicker } from './YearPicker';
import { WeekPicker } from './WeekPicker';
import { QuarterPicker } from './QuarterPicker';
import { Button, OutlinedButton } from '../Button';
import { BaseDatePickerProps, WeekPickerProps, YearPickerProps } from '../../types';

const { DAY, WEEK, SINGLE_WEEK, MONTH, SINGLE_MONTH, QUARTER, SINGLE_QUARTER, YEAR, SINGLE_YEAR } =
  GRANULARITIES;

const Container = styled.fieldset`
  display: flex;
  margin-top: 1rem;
  padding: 0;
  border: none;
  margin-inline-start: 0;
  margin-inline-end: 0;
  padding-block-start: 0;
  padding-inline-start: 0;
  padding-inline-end: 0;
  padding-block-end: 0;
  justify-content: space-between;

  .MuiFormControl-root {
    margin-right: 0.4rem;
    flex: 1;
    &:last-child {
      margin-right: 0;
    }
  }
  .MuiFormLabel-root {
    font-size: 0.875rem;
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    margin-bottom: 0.4rem;
  }
  .MuiSelect-root {
    color: ${props => props.theme.palette.text.primary};
    font-size: 0.875rem;
    &:focus {
      background-color: transparent;
    }
  }
`;

const RowLegendWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
  width: 15%;
`;
const RowLegend = styled(Typography).attrs({
  component: 'legend',
})`
  padding-inline-end: 0;
  padding-inline-start: 0;
  font-size: 0.875rem;
`;

type DateRowProps = (BaseDatePickerProps | YearPickerProps | WeekPickerProps) & {
  granularity: typeof GRANULARITY_SHAPE;
  title?: string;
};

const DateRow = ({ title, ...props }: DateRowProps) => {
  const { granularity } = props;
  const getDatePickerComponent = () => {
    switch (granularity) {
      default:
      case DAY:
        return (
          <>
            <DayPicker {...props} />
            <MonthPicker {...props} />
            <YearPicker {...(props as YearPickerProps)} granularity={granularity} />
          </>
        );
      case SINGLE_WEEK:
      case WEEK:
        return (
          <>
            <WeekPicker {...props} />
            <YearPicker {...(props as YearPickerProps)} isIsoYear granularity={granularity} />
          </>
        );
      case MONTH:
      case SINGLE_MONTH:
        return (
          <>
            <MonthPicker {...props} />
            <YearPicker {...(props as YearPickerProps)} granularity={granularity} />
          </>
        );
      case QUARTER:
      case SINGLE_QUARTER:
        return (
          <>
            <QuarterPicker {...props} />
            <YearPicker {...(props as YearPickerProps)} granularity={granularity} />
          </>
        );
      case YEAR:
      case SINGLE_YEAR:
        return <YearPicker {...(props as YearPickerProps)} granularity={granularity} />;
    }
  };
  return (
    <Container>
      {title && (
        <RowLegendWrapper>
          <RowLegend>{title}</RowLegend>
        </RowLegendWrapper>
      )}
      {getDatePickerComponent()}
    </Container>
  );
};

const getLabelText = (granularity: string) => {
  switch (granularity) {
    default:
      return 'Select dates';
    case SINGLE_WEEK:
      return 'Select week';
    case SINGLE_MONTH:
      return 'Select month';
    case SINGLE_YEAR:
      return 'Select year';
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
  onSetNewDates: (startDate: Moment, endDate: Moment) => void;
  weekDisplayFormat?: string;
  muiDialogProps?: Omit<DialogProps, 'open' | 'onClose'>;
  dateRangeDelimiter?: string;
  dateOffset?: DatePickerOffsetSpec;
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
  muiDialogProps = {},
  dateRangeDelimiter,
  dateOffset,
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

    const { momentUnit } = GRANULARITY_CONFIG[granularity as keyof typeof GRANULARITY_CONFIG];

    const getStartDate = () => {
      if (dateOffset && isSingleDate) {
        return selectedEndDate.clone().subtract(1, momentUnit as moment.DurationInputArg2);
      }
      if (isSingleDate) {
        return selectedEndDate.clone();
      }
      return selectedStartDate;
    };

    // calculate the rounded start date
    const startDate = getStartDate();
    const roundedStartDate = roundStartDate(granularity, startDate, dateOffset);

    // Only update if the dates have actually changed by at least one day
    if (
      !momentStartDate.isSame(roundedStartDate, 'day') ||
      !momentEndDate.isSame(selectedEndDate, 'day')
    ) {
      // Update the external control values!
      onSetNewDates(roundedStartDate, selectedEndDate);
    }
    onClose();
    return setErrorMessage('');
  };

  // in case of resetting the date values programmatically, update the selected values in state so they are accurate
  useEffect(() => {
    if (!momentStartDate?.isSame(selectedStartDate)) {
      setSelectedStartDate(momentStartDate);
    }
    if (!momentEndDate?.isSame(selectedEndDate)) {
      setSelectedEndDate(momentEndDate);
    }
  }, [momentStartDate?.format('DD/MM/YYYY'), momentEndDate?.format('DD/MM/YYYY')]);

  useEffect(() => {
    if (!isSingleDate) return;

    const { momentUnit } = granularity;
    const newStartDate = selectedEndDate.clone().subtract(1, momentUnit);
    setSelectedStartDate(newStartDate);
  }, [selectedEndDate?.format('DD/MM/YYYY')]);

  return (
    <Dialog
      open={isOpen}
      maxWidth="sm"
      id="date-picker-dialog"
      disableRestoreFocus
      {...muiDialogProps}
    >
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
            title="Start date"
            dateOffset={dateOffset}
            dateRangeDelimiter={dateRangeDelimiter}
            valueKey="startDate"
          />
        )}
        <DateRow
          granularity={granularity}
          momentDateValue={selectedEndDate}
          minMomentDate={minMomentDate}
          maxMomentDate={maxMomentDate}
          onChange={setSelectedEndDate}
          weekDisplayFormat={weekDisplayFormat}
          title={isSingleDate ? '' : 'End date'}
          dateOffset={dateOffset}
          dateRangeDelimiter={dateRangeDelimiter}
          valueKey="endDate"
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
