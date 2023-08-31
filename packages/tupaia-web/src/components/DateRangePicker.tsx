/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Moment } from 'moment';
import { GRANULARITIES } from '@tupaia/utils';
import { DateRangePicker as DateRangePickerComponent, TextButton } from '@tupaia/ui-components';
import styled from 'styled-components';
import { ValueOf } from '../types';

const Wrapper = styled.div`
  margin-top: 0.5rem;
  margin-left: -0.2rem;
  .MuiBox-root {
    justify-content: space-between;
    button,
    span {
      background-color: transparent;
      border-color: transparent;
      margin: 0;
      padding: 0.2rem;
      text-transform: none;
      font-size: 0.875rem;
      min-width: 0;
      color: ${({ theme }) => theme.palette.text.primary};
      svg {
        height: 1.3rem;
        width: 1.3rem;
      }
      .MuiIconButton-label {
        padding: 0;
      }
    }
    button {
      min-height: unset;
      min-width: unset;
      &:hover,
      &:focus {
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
  startDate?: Moment;
  endDate?: Moment;
  granularity?: ValueOf<typeof GRANULARITIES>;
  onSetDates?: (startDate: string, endDate: string) => void;
  minDate?: string;
  maxDate?: string;
  onResetDate?: () => void;
  weekDisplayFormat?: string;
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
      />
      <ResetButton onClick={onResetDate}>Reset to default</ResetButton>
    </Wrapper>
  );
};
