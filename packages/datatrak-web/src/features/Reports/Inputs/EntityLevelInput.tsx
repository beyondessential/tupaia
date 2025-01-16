import React from 'react';
import styled from 'styled-components';
import { Controller } from 'react-hook-form';
import { RadioGroup as BaseRadioGroup } from '@tupaia/ui-components';
import { InputWrapper } from './InputWrapper';

const RadioGroup = styled(BaseRadioGroup)`
  margin: 0;
  max-width: 100%;
  .MuiFormGroup-root {
    width: 100%;
    border: none;
    flex-wrap: nowrap;
  }
  .MuiFormControlLabel-label {
    font-size: 0.875rem;
  }

  .MuiFormControlLabel-root {
    width: 48%;
    border: 1px solid ${({ theme }) => theme.palette.divider};
    background: transparent;
    border-radius: 0.3rem;
    &:last-child {
      border-right: 1px solid ${({ theme }) => theme.palette.divider}; // override styling in ui components
    }
    &:has(.Mui-checked) {
      background-color: ${({ theme }) => theme.palette.primary.main}33;
      border-color: ${({ theme }) => theme.palette.primary.main};
    }
  }
  ${({ theme }) => theme.breakpoints.down('xs')} {
    .MuiFormGroup-root {
      flex-direction: column;
    }
    .MuiFormControlLabel-root {
      width: 100%;
      &:not(:last-child) {
        margin-bottom: 1rem;
      }
    }
  }
`;

export const EntityLevelInput = () => {
  return (
    <InputWrapper>
      <Controller
        name="entityLevel"
        rules={{ required: 'Required' }}
        render={({ ref, onChange, value }, { invalid }) => (
          <RadioGroup
            label="Entity level"
            name="entityLevel"
            options={[
              { label: 'Country', value: 'country' },
              { label: 'Entity', value: 'entity' },
            ]}
            id="entityLevel"
            required
            onChange={onChange}
            value={value}
            inputRef={ref}
            radioGroupProps={{
              row: true,
              defaultValue: 'country',
              'aria-invalid': invalid,
            }}
          />
        )}
      />
    </InputWrapper>
  );
};
