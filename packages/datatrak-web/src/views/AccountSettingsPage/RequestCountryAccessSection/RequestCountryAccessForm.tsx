/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { UseQueryResult } from 'react-query';
import { FormLabel, useMediaQuery, useTheme } from '@material-ui/core';
import { Entity, ProjectResponse, TupaiaWebProjectCountryAccessListRequest } from '@tupaia/types';
import { Form, FormInput, TextField } from '@tupaia/ui-components';
import { useRequestProjectAccess } from '../../../api';
import { Button } from '../../../components';
import { errorToast, successToast } from '../../../utils';
import { RequestableCountryChecklist } from './RequestableCountryChecklist';

const StyledForm = styled(Form)`
  inline-size: 100%;

  ${({ theme }) => theme.breakpoints.up('md')} {
    max-inline-size: 44.25rem;
  }
`;

const StyledFieldset = styled.fieldset`
  display: grid;
  gap: 1.25rem;
  grid-auto-flow: column;
  grid-template: auto auto / auto;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    block-size: 18.32rem;
    grid-template: auto / 1fr 1fr;
  }

  .MuiFormLabel-root {
    color: ${({ theme }) => theme.palette.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }

  // Fix labels appearing over hamburger menu drawer
  .MuiInputLabel-outlined {
    z-index: auto;
  }
`;

const CountryChecklistWrapper = styled.div`
  block-size: 100%;
  display: block flex;
  flex-direction: column;
  overflow: hidden;
`;

/** Matches styling of `.FormLabel-root` in ui-components `TextField` */
const StyledFormLabel = styled(FormLabel)`
  font-size: 0.9375rem;
  line-height: 1.125rem;
  margin-block-end: 0.1875rem;
`;

const Flexbox = styled.div`
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

interface RequestCountryAccessFormProps {
  countryAccessList: UseQueryResult<WebServerProjectCountryAccessListRequest.ResBody>;
  project?: ProjectResponse | null;
}

interface RequestCountryAccessFormFields {
  entityIds: Entity['id'][];
  message?: string;
}

export const RequestCountryAccessForm = ({
  countryAccessList,
  project,
}: RequestCountryAccessFormProps) => {
  const { data: countries, isLoading: accessListIsLoading } = countryAccessList;
  const projectCode = project?.code;
  const applicableCountries =
    countries?.filter(country => project?.names?.includes(country.name)) ?? [];

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
   * Semantically, this belongs in `RequestableCountryChecklist` (child of this component), but
   * `setSelectedCountries` is used here to circumvent some quirks of how React Hook Form +
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

  const { breakpoints } = useTheme();
  const sizeClassIsMdOrLarger = useMediaQuery(breakpoints.up('sm'));

  const getTooltip = () => {
    if (!project) return 'Select a project to request country access';
    return isValid ? undefined : 'Select countries to request access';
  };

  const formIsSubmitting = isSubmitting || requestIsLoading;
  const formIsInsubmissible =
    !project || isValidating || !isValid || accessListIsLoading || formIsSubmitting;

  function onSubmit({ entityIds, message }: RequestCountryAccessFormFields) {
    requestCountryAccess({
      entityIds,
      message,
      projectCode, // Should not be undefined by this point, but TS can’t pick up that form is disabled if project is undefined
    });
  }

  return (
    <StyledForm formContext={formContext} onSubmit={handleSubmit(onSubmit)}>
      <StyledFieldset disabled={!project || formIsSubmitting}>
        <CountryChecklistWrapper>
          <StyledFormLabel>Select countries</StyledFormLabel>
          <RequestableCountryChecklist
            projectCode={projectCode}
            countries={applicableCountries}
            disabled={formIsSubmitting}
            selectedCountries={selectedCountries}
            setSelectedCountries={setSelectedCountries}
          />
        </CountryChecklistWrapper>
        <Flexbox>
          <StyledFormInput
            id="message"
            Input={TextField}
            inputProps={{
              enterKeyHint: 'done',
              /*
               * Make `<textarea>` scroll upon overflow.
               *
               * MUI uses inline styling (element.style) to resize `<textarea>`s to fit an integer
               * number of lines. This behaviour is desirable in single-column layouts, which we use
               * in smaller size classes. In a multi-column grid it causes misalignment, so we
               * override it, also with inline styling.
               */
              style: sizeClassIsMdOrLarger ? { height: '100%', overflow: 'auto' } : undefined,
            }}
            label="Reason for access"
            name="message"
          />
          <Button disabled={formIsInsubmissible} tooltip={getTooltip()} type="submit">
            {formIsSubmitting ? 'Submitting request' : 'Request access'}
          </Button>
        </Flexbox>
      </StyledFieldset>
    </StyledForm>
  );
};
