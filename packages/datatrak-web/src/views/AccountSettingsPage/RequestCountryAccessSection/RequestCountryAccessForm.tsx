/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Box, FormLabel, useMediaQuery } from '@material-ui/core';
import { Entity } from '@tupaia/types';
import { Form, FormInput, TextField } from '@tupaia/ui-components';
import { ensure } from '@tupaia/tsutils';
import { Button } from '../../../components';
import { errorToast, successToast } from '../../../utils';
import { theme } from '../../../theme';
import { useCountryAccessList, useCurrentUser, useRequestProjectAccess } from '../../../api';
import { RequestableCountryChecklist } from './RequestableCountryChecklist.tsx';

const StyledForm = styled(Form)`
  inline-size: 100%;
  ${theme.breakpoints.up('md')} {
    max-inline-size: 44.25rem;
  }
`;

const StyledFieldset = styled.fieldset`
  block-size: 18.32rem;
  border: none;
  display: grid;
  gap: 1.25rem;
  grid-auto-flow: column;
  grid-template: auto auto / auto;
  margin: 0;
  padding: 0;

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
  block-size: 100%;
  display: block flex;
  flex-direction: column;
  grid-row: 1 / -1;
  overflow: hidden;
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
const StyledFormInput = styled(FormInput).attrs({
  fullWidth: true,
  multiline: true,
})`
  block-size: 100%;
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
    reset,
  } = formContext;

  /*
   * Semantically, this belongs in RequestableCountryChecklist (child of this component), but
   * setSelectedCountries is used here to circumvent some quirks of how React Hook Form +
   * MUI checkboxes (mis-)handle multiple checkboxes with the same control name.
   */
  const [selectedCountries, setSelectedCountries] = useState([] as Entity['id'][]);
  const resetForm = () => {
    reset();
    setSelectedCountries([]);
  };

  const { mutate: requestCountryAccess, isLoading: requestIsLoading } = useRequestProjectAccess({
    onError: error =>
      errorToast(error?.message ?? 'Sorry, couldn’t submit your request. Please try again'),
    onSettled: resetForm,
    onSuccess: response => successToast(response.message),
  });

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
            projectCode={projectCode}
            countries={applicableCountries}
            selectedCountries={selectedCountries}
            setSelectedCountries={setSelectedCountries}
            disabled={!project}
          />
        </CountryChecklistWrapper>
        <StyledBox>
          <StyledFormInput
            disabled={!project}
            id="message"
            Input={TextField}
            inputProps={{
              enterKeyHint: 'done',
              // Make <textarea> scroll upon overflow. MUI uses inline styling (element.style) to
              // resize it to fit an integer number of lines, so we must do the same to override it.
              style: sizeClassIsMdOrLarger ? { height: '100%', overflow: 'auto' } : {},
            }}
            label="Reason for access"
            name="message"
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
