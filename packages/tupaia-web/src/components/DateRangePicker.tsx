/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Moment } from 'moment';
import { DatePickerOffsetSpec, VizPeriodGranularity } from '@tupaia/types';
import { DateRangePicker as DateRangePickerComponent, TextButton } from '@tupaia/ui-components';
import styled from 'styled-components';

const Wrapper = styled.div`
  margin-top: 0.5rem;
  margin-left: -0.2rem;
  .MuiBox-root {
    justify-content: space-between;

    .MuiTypography-root {
      color: ${({ theme }) => theme.palette.text.primary};
      background-color: transparent;
      border-color: transparent;
      padding: 0.2rem;
      font-size: 0.875rem;
      min-width: 0;
    }

    button {
      background-color: transparent;
      border-color: transparent;
      min-height: unset;
      min-width: unset;
      &:hover {
        background-color: rgba(255, 255, 255, 0.3);
      }
    }
  }
`;

const ResetButton = styled(TextButton)`
  opacity: 0.6;
  line-height: 1;
  min-height: unset;
  min-width: unset;
  font-size: 0.75rem;
  text-transform: none;
  padding: 0 0.3rem;
  &:hover,
  &:focus {
    background-color: transparent;
    text-decoration: underline;
    opacity: 1;
  }
`;

const DialogPaperComponent = styled.div`
  border-radius: 3px;
  h3 {
    font-weight: ${({ theme }) => theme.typography.fontWeightRegular};
  }
  .MuiSelect-root {
    color: ${({ theme }) => theme.palette.text.primary};
    &:focus {
      background-color: transparent;
    }
  }
  .MuiInputBase-root {
    background-color: transparent;
  }
  button {
    text-transform: none;
  }
  .MuiButton-outlined {
    border-color: ${({ theme }) => theme.palette.text.primary};
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

interface DateRangePickerProps {
  startDate?: Moment | string;
  endDate?: Moment | string;
  granularity?: `${VizPeriodGranularity}`;
  onSetDates?: (startDate: string, endDate: string) => void;
  minDate?: string;
  maxDate?: string;
  onResetDate?: () => void;
  weekDisplayFormat?: string;
  dateOffset?: DatePickerOffsetSpec;
  dateRangeDelimiter?: string;
}

export const DateRangePicker = ({
  startDate,
  endDate,
  granularity,
  minDate,
  maxDate,
  onSetDates,
  onResetDate,
  weekDisplayFormat,
  dateOffset,
  dateRangeDelimiter,
}: DateRangePickerProps) => {
  return (
    <Wrapper>
      <DateRangePickerComponent
        startDate={startDate}
        endDate={endDate}
        granularity={granularity}
        minDate={minDate}
        maxDate={maxDate}
        onSetDates={onSetDates}
        weekDisplayFormat={weekDisplayFormat}
        dialogProps={{
          PaperComponent: DialogPaperComponent,
        }}
        dateOffset={dateOffset}
        dateRangeDelimiter={dateRangeDelimiter}
      />
      <ResetButton onClick={onResetDate}>Reset to default</ResetButton>
    </Wrapper>
  );
};
