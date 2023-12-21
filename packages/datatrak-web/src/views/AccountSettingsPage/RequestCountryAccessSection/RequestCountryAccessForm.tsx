/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Box, FormLabel, useMediaQuery } from '@material-ui/core';
import { Form, FormInput, TextField } from '@tupaia/ui-components';
import { Button } from '../../../components';
import { errorToast, successToast } from '../../../utils';
import { theme } from '../../../theme';
import { useCountryAccessList, useCurrentUser, useRequestProjectAccess } from '../../../api';
import { RequestableCountryChecklist } from './RequestableCountryChecklist.tsx';
import { ensure } from '@tupaia/tsutils';
import { Entity } from '@tupaia/types';

const StyledForm = styled(Form)`
  inline-size: 100%;
  ${theme.breakpoints.up('md')} {
    max-inline-size: 44.25rem;
  }
`;

const StyledFieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;

  display: grid;
  gap: 1.25rem;
  grid-auto-flow: column;
  grid-template: auto auto / auto;

  ${theme.breakpoints.up('sm')} {
    grid-template: auto / 1fr 1fr;
  }

  .MuiFormLabel-root {
    color: ${theme.palette.text.primary};
    font-weight: ${theme.typography.fontWeightMedium};
  }

  // Fix labels appearing over hamburger menu drawer
  .MuiInputLabel-outlined {
    z-index: auto;
  }
`;

const CountryChecklistWrapper = styled(Box)`
  display: block flex;
  flex-direction: column;
  height: 18.3rem;
`;

/** Matches styling of .FormLabel-root in ui-components TextField */
const StyledFormLabel = styled(FormLabel)`
  font-size: 0.9375rem;
  line-height: 1.125rem;
  margin-block-end: 0.1875rem;
`;

const StyledBox = styled(Box)`
  display: block flex;
  flex-direction: column;
  gap: 1.25rem;
`;

// Usage of this component has inline styling. See there for explanation.
const StyledFormInput = styled(FormInput)`
  flex-grow: 1;
  margin: 0;

  .MuiInputBase-root {
    align-items: start;
    block-size: 100%;
    max-block-size: 100%;
  }

  .MuiInputBase-input {
    box-sizing: border-box;
  }
`;

interface RequestCountryAccessFormFields {
  entityIds: Entity['id'][];
  message?: string;
}

export const RequestCountryAccessForm = () => {
  const { project } = useCurrentUser();
  const projectCode = ensure(project?.code);

  const { data: countries = [], isLoading: accessListIsLoading } = useCountryAccessList();
  const applicableCountries = countries.filter(country => project?.names?.includes(country.name));

  const formContext = useForm<RequestCountryAccessFormFields>({
    defaultValues: {
      entityIds: [],
      message: '',
    } as RequestCountryAccessFormFields,
    mode: 'onChange',
  });
  const {
    formState: { isSubmitting, isValidating, isValid },
    handleSubmit,
    reset: resetForm,
  } = formContext;

  const { mutate: requestCountryAccess, isLoading: requestIsLoading } = useRequestProjectAccess({
    onError: error =>
      errorToast(error?.message ?? 'Sorry, couldn’t submit your request. Please try again'),
    onSettled: resetForm,
    onSuccess: response => {
      successToast(response.message);
      rerenderCountryChecklist();
    },
  });

  /**
   * When React Hook Form resets the form state, boxes get correctly unchecked, but the MUI
   * component fails to reflect this until its next render (usually when the user interacts with it,
   * which makes the checkbox feel broken). setCountryCheckList serves merely as an "automatic
   * kicking machine" to force a re-render.
   */
  const [countryChecklistKey, setCountryChecklistKey] = useState(Date.now());
  /**
   * HACK: Force a fresh render of the country checklist. Use when a MUI checkbox appears checked,
   * but is actually unchecked (or vice versa).
   */
  const rerenderCountryChecklist = () => setCountryChecklistKey(Date.now());

  const sizeClassIsMdOrLarger = useMediaQuery(theme.breakpoints.up('sm'));

  const formIsNotSubmissible =
    !project || isValidating || !isValid || isSubmitting || accessListIsLoading || requestIsLoading;
  const buttonLabel = isSubmitting || requestIsLoading ? 'Submitting request' : 'Request access';

  function onSubmit({ entityIds, message }: RequestCountryAccessFormFields) {
    requestCountryAccess({
      entityIds,
      message,
      projectCode,
    });
  }

  return (
    <StyledForm formContext={formContext} onSubmit={handleSubmit(onSubmit)}>
      <StyledFieldset disabled={isSubmitting || requestIsLoading}>
        <CountryChecklistWrapper>
          <StyledFormLabel>Select countries</StyledFormLabel>
          <RequestableCountryChecklist
            countries={applicableCountries}
            disabled={!project}
            key={countryChecklistKey}
            projectCode={projectCode}
          />
        </CountryChecklistWrapper>
        <StyledBox>
          <StyledFormInput
            disabled={!project}
            fullWidth
            id="message"
            Input={TextField}
            inputProps={{
              enterKeyHint: 'done',
              // Make <textarea> scroll upon overflow. MUI uses inline styling (element.style) to
              // dynamically resize it to fit content, so we must do the same to override it.
              style: sizeClassIsMdOrLarger ? { height: '100%', overflow: 'scroll' } : {},
            }}
            label="Reason for access"
            margin="none"
            multiline
            name="message"
            size="medium"
          />
          <Button
            disabled={formIsNotSubmissible}
            tooltip={isValid ? undefined : 'Select countries to request access'}
            type="submit"
          >
            {buttonLabel}
          </Button>
        </StyledBox>
      </StyledFieldset>
    </StyledForm>
  );
};
