/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Paper, Typography, Link } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { Form as BaseForm, RadioGroup as BaseRadioGroup } from '@tupaia/ui-components';
import { useSurveys } from '../../api';
import { Autocomplete as BaseAutocomplete } from '../../components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Container = styled(Paper).attrs({
  elevation: 0,
})`
  width: 100%;
  max-width: 38rem;
  padding: 1.81rem 3.12rem;
`;

const InlineLink = styled(Link)`
  text-decoration: underline;
`;

const Form = styled(BaseForm)`
  margin-top: 1.88rem;
  .MuiFormLabel-root,
  legend {
    color: inherit;
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
`;

const Autocomplete = styled(BaseAutocomplete)`
  .MuiAutocomplete-input {
    font-size: 0.875rem;
  }
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
  }
`;

const RadioGroup = styled(BaseRadioGroup)`
  margin-top: 1.88rem;
  .MuiFormGroup-root {
    width: 100%;
    justify-content: space-between;
    border: none;
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
`;

export const ReportsForm = () => {
  const formContext = useForm();
  const { register } = formContext;
  const { data: surveys } = useSurveys();

  return (
    <Wrapper>
      <Container>
        <Typography>
          Download a raw data excel file to complete your own analysis. If the desired report is not
          available, please contact{' '}
          <InlineLink href="mailto:support@tupaia.org" color="textPrimary">
            support@tupaia.org
          </InlineLink>
          .
        </Typography>
        <Form onSubmit={() => {}} formContext={formContext}>
          <Autocomplete
            label="Survey"
            options={surveys?.map(({ code, name }) => ({ value: code, label: name })) ?? []}
            name="survey"
            required
            getOptionLabel={option => option.label}
            placeholder="Select survey..."
            muiProps={{
              disablePortal: true,
            }}
            inputRef={register({
              required: 'Required',
            })}
          />
          <RadioGroup
            label="Entity level *"
            name="entityLevel"
            options={[
              { label: 'Country', value: 'country' },
              { label: 'Entity', value: 'Entity' },
            ]}
            required
            inputRef={register({
              required: 'Required',
            })}
            radioGroupProps={{
              row: true,
              defaultValue: 'country',
            }}
          />
        </Form>
      </Container>
    </Wrapper>
  );
};
