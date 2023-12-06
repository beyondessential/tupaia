/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Form } from '@tupaia/ui-components';
import { useForm } from 'react-hook-form';
import { Box } from '@material-ui/core';

const StyledForm = styled(Form)`
  width: 100%;
  ${({ theme }) => theme.breakpoints.up('md')} {
    max-width: 44.25rem;
  }
`;

const StyledFieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;
  align-items: end;
  display: grid;
  gap: 1.56rem 1.25rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    grid-template-columns: repeat(2, 1fr);
  }
  .MuiFormLabel-root {
    color: ${props => props.theme.palette.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }
  .MuiInputLabel-outlined {
    // Fix labels appearing over hamburger menu drawer (in md and sm size classes)
    z-index: auto;
  }
`;

const CountryList = styled(Box)`
  border-radius: 0.1875rem;
  border: 1px solid ${props => props.theme.palette.divider};
`;

export const RequestCountryAccessForm = () => {
  const formContext = useForm();

  return (
    <StyledForm formContext={formContext}>
      <StyledFieldset></StyledFieldset>
    </StyledForm>
  );
};
