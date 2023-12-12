/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Paper, Typography, Link } from '@material-ui/core';
import { useForm } from 'react-hook-form';
import { Autocomplete as BaseAutocomplete, Form as BaseForm } from '@tupaia/ui-components';
import { useSurveys } from '../../api';

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
  .MuiFormLabel-root {
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
`;

export const ReportsForm = () => {
  const formContext = useForm();
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
            options={surveys || []}
            name="survey"
            required
            getOptionLabel={option => option.name}
            placeholder="Select survey..."
          />
        </Form>
      </Container>
    </Wrapper>
  );
};
