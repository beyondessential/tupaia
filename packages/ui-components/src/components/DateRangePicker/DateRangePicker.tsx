import React, { useState } from 'react';
import { Moment } from 'moment';
import styled from 'styled-components';
import {
  DialogProps,
  Typography,
  CircularProgress,
  Button as MuiButton,
  ButtonGroup as MuiButtonGroup,
  IconButton as MuiIconButton,
} from '@material-ui/core';
import { DateRange, KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { DatePickerOffsetSpec } from '@tupaia/types';
import { GRANULARITIES, GRANULARITY_SHAPE } from '@tupaia/utils';
import { FlexStart } from '../Layout';
import { WeekDisplayFormatType } from '../../types';
import { useDateRangePicker } from './useDateRangePicker';
import { DatePickerDialog } from './DatePickerDialog';

const IconButton = styled(MuiIconButton)`
  background: white;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
  padding: 0.7rem 0.8rem;
  margin-left: 0.9rem;
  min-height: 3.1rem;
  min-width: 3.25rem;

  .MuiSvgIcon-root {
    color: ${props => props.theme.palette.text.tertiary};
    height: 1.3rem;
    width: 1.3rem;
  }
`;

const Button = styled(MuiButton)`
  background: white;
  padding: 0.7rem;
  font-size: 1rem;
  min-height: 3.1rem;
  line-height: 1.2rem;
  font-weight: 400;
  border-color: ${props => props.theme.palette.grey['400']};

  .MuiSvgIcon-root {
    color: ${props => props.theme.palette.text.tertiary};
  }
`;

const Label = styled(Typography)`
  padding-left: 1rem;
  padding-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.palette.text.secondary};
  font-size: 1rem;
  background-color: white;
  border-left-width: 2px;
  cursor: auto;
  min-width: 8rem;
  button + & {
    border: 1px solid ${props => props.theme.palette.grey['400']};
    min-width: 8rem;
  }
  &.MuiButtonGroup-groupedOutlinedHorizontal {
    margin-left: 0;
  }
`;

interface DateRangePickerProps {
  startDate?: Moment | string;
  endDate?: Moment | string;
  minDate?: string;
  maxDate?: string;
  granularity?: typeof GRANULARITY_SHAPE;
  onSetDates?: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
  weekDisplayFormat?: WeekDisplayFormatType;
  dialogProps?: Omit<DialogProps, 'open' | 'onClose'>;
  dateOffset?: DatePickerOffsetSpec;
  dateRangeDelimiter?: string;
}

export const DateRangePicker = ({
  startDate,
  endDate,
  minDate,
  maxDate,
  granularity = GRANULARITIES.DAY,
  onSetDates = () => {},
  isLoading = false,
  weekDisplayFormat,
  dialogProps,
  dateOffset,
  dateRangeDelimiter,
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isSingleDate,
    currentStartDate,
    currentEndDate,
    handleDateChange,
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
    weekDisplayFormat,
    dateOffset,
    dateRangeDelimiter,
  });

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <FlexStart>
        <MuiButtonGroup>
          {isSingleDate && (
            <Button
              aria-label="prev"
              onClick={() => changePeriod(-1)}
              disabled={isLoading || prevDisabled}
            >
              <KeyboardArrowLeft />
            </Button>
          )}
          <Label aria-label="active-date">{labelText}</Label>
          {isSingleDate && (
            <Button
              type="button"
              aria-label="next"
              onClick={() => changePeriod(1)}
              disabled={isLoading || nextDisabled}
            >
              <KeyboardArrowRight />
            </Button>
          )}
        </MuiButtonGroup>
        <IconButton onClick={handleOpen}>
          {isLoading ? <CircularProgress size={21} /> : <DateRange />}
        </IconButton>
      </FlexStart>
      <DatePickerDialog
        granularity={granularity}
        startDate={currentStartDate}
        endDate={currentEndDate}
        minDate={minDate}
        maxDate={maxDate}
        isOpen={isOpen}
        onClose={handleClose}
        onSetNewDates={handleDateChange}
        weekDisplayFormat={weekDisplayFormat}
        muiDialogProps={dialogProps}
        dateOffset={dateOffset}
        dateRangeDelimiter={dateRangeDelimiter}
      />
    </>
  );
};
