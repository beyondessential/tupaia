import React from 'react';
import styled from 'styled-components';
import { useFormContext, Controller } from 'react-hook-form';
import { DateTimePicker as BaseDateTimePicker } from '@tupaia/ui-components';
import { InputHelperText } from '../../../components';
import { InputWrapper } from './InputWrapper';

// get the date format string from the browser's locale
const getDateFormatString = () => {
  const formatObj = new Intl.DateTimeFormat('default').formatToParts(new Date());

  return formatObj
    .map(obj => {
      switch (obj.type) {
        case 'day':
          return 'dd';
        case 'month':
          return 'MM';
        case 'year':
          return 'yyyy';
        default:
          return obj.value;
      }
    })
    .join('');
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  ${({ theme }) => theme.breakpoints.down('xs')} {
    flex-direction: column;
  }
`;

const DateTimePicker = styled(BaseDateTimePicker)`
  width: 100%;
  margin-bottom: 1rem;
  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
  }
  .MuiInputBase-root.Mui-error {
    background-color: inherit;
  }

  ${({ theme }) => theme.breakpoints.up('sm')} {
    width: calc(50% - 0.5rem);
    margin-bottom: 0;
    &:first-child {
      position: relative;
      &:after {
        content: '';
        position: absolute;
        border-top: 1px solid ${({ theme }) => theme.palette.divider};
        width: 1rem;
        height: 100%;
        right: -1rem;
        top: 65%;
      }
    }
    &:has(.Mui-error) {
      &:after {
        border-color: ${({ theme }) => theme.palette.error.main};
      }
    }
  }
`;

export const DateRangePicker = () => {
  // we need to use controlled inputs here because the date time picker sets a default value of now, which means out uncontrolled updates are ignored

  const { errors, getValues } = useFormContext();

  const errorMessage = errors.startDate?.message || errors.endDate?.message;
  const dateFormat = getDateFormatString();

  const placeholder = dateFormat.toLowerCase();

  return (
    <InputWrapper>
      <Container>
        <Controller
          name="startDate"
          rules={{
            validate: {
              isBefore: (value: string) => {
                const endDate = getValues('endDate');
                const startDate = new Date(value);
                if (!endDate || !value) return true; // don't validate if end date is empty (i.e. not yet selected)
                return startDate < new Date(endDate) ? true : 'Start date must be before end date';
              },
            },
          }}
          render={({ ref, onChange, value, name }) => (
            <DateTimePicker
              name={name}
              label="Start date"
              id="startDate"
              inputVariant="outlined"
              onChange={onChange}
              value={value}
              inputRef={ref}
              error={!!errorMessage}
              aria-describedby={errorMessage ? 'date-error-message' : undefined}
              placeholder={placeholder}
              format={dateFormat}
            />
          )}
        />
        <Controller
          name="endDate"
          rules={{
            validate: {
              isAfter: (value: string) => {
                const startDate = getValues('startDate');
                const endDate = new Date(value);
                if (!startDate || !value) return true; // don't validate if start date is empty (i.e. not yet selected
                return endDate > new Date(startDate) ? true : 'Start date must be before end date';
              },
            },
          }}
          render={({ ref, onChange, value, name }) => (
            <DateTimePicker
              name={name}
              label="End date"
              inputVariant="outlined"
              onChange={onChange}
              value={value}
              id="endDate"
              inputRef={ref}
              error={!!errorMessage}
              aria-describedby={errorMessage ? 'date-error-message' : undefined}
              placeholder={placeholder}
              format={dateFormat}
            />
          )}
        />
      </Container>
      {errorMessage && (
        <InputHelperText error id="date-error-message">
          {errorMessage}
        </InputHelperText>
      )}
    </InputWrapper>
  );
};
