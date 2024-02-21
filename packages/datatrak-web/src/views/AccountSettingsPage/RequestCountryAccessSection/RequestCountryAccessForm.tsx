/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { FormLabel, useMediaQuery, useTheme } from '@material-ui/core';
import { Entity } from '@tupaia/types';
import { Form, FormInput, TextField } from '@tupaia/ui-components';
import { useCountryAccessList, useCurrentUser, useRequestProjectAccess } from '../../../api';
import { Button } from '../../../components';
import { errorToast, successToast } from '../../../utils';
import { RequestableCountryChecklist } from './RequestableCountryChecklist';

const StyledForm = styled(Form)`
  display: flex;
  flex-direction: column;
  gap: 1.56rem;
  inline-size: 100%;
  ${({ theme }) => theme.breakpoints.up('md')} {
    max-inline-size: 44.25rem;
  }
`;

const StyledFieldset = styled.fieldset`
  block-size: 18.32rem;
  display: grid;
  gap: 1.25rem;
  grid-auto-flow: column;
  grid-template: auto auto / auto;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    grid-template: auto / 1fr 1fr;
  }

  // In single-column layout, disregard gridlines and honour AccountSettingsSection’s flex layout
  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: contents;
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

/**
 * @privateRemarks TODO: Import this from @tupaia/tsutils.
 *
 * This is more or less replicated from `typeGuards.ts` in tsutils, because importing it here seems
 * to indirectly cause DataTrak to crash on remote deployments.
 *
 * @see https://beyondessential.slack.com/archives/C032DCHKTGR/p1708553985766539?thread_ts=1707443585.079349&cid=C032DCHKTGR
 */
function assertIsNotNullish<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(`Expected project to be defined, but got ${val}`);
  }
}

interface RequestCountryAccessFormFields {
  entityIds: Entity['id'][];
  message?: string;
}

export const RequestCountryAccessForm = () => {
  const { project } = useCurrentUser();

  // If `RequestCountryAccessForm` is being rendered, the user should already have a project
  // selected. Otherwise, they should’ve been redirected to select a project by now.
  assertIsNotNullish(project);
  const projectCode = project.code;

  const { data: countries = [], isLoading: accessListIsLoading } = useCountryAccessList();
  const applicableCountries = countries.filter(country => project.names?.includes(country.name));

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

  const formIsSubmitting = isSubmitting || requestIsLoading;
  const formIsInsubmissible =
    !project || isValidating || !isValid || accessListIsLoading || formIsSubmitting;

  function onSubmit({ entityIds, message }: RequestCountryAccessFormFields) {
    requestCountryAccess({
      entityIds,
      message,
      projectCode,
    });
  }

  return (
    <StyledForm formContext={formContext} onSubmit={handleSubmit(onSubmit)}>
      <StyledFieldset disabled={formIsSubmitting}>
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
        <Flexbox>
          <StyledFormInput
            disabled={!project}
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
          <Button
            disabled={formIsInsubmissible}
            tooltip={isValid ? undefined : 'Select countries to request access'}
            type="submit"
          >
            {formIsSubmitting ? 'Submitting request' : 'Request access'}
          </Button>
        </Flexbox>
      </StyledFieldset>
    </StyledForm>
  );
};
