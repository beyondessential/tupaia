/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Box as MuiBox, FormLabel as MuiFormLabel, useMediaQuery } from '@material-ui/core';
import { Checkbox, Form, FormInput, TextField } from '@tupaia/ui-components';
import { Country, TupaiaWebCountryAccessListRequest } from '@tupaia/types';
import { Button } from '../../../components';
import { theme } from '../../../theme';
import { useCountryAccessList, useCurrentUser, useRequestProjectAccess } from '../../../api';
import { errorToast, successToast } from '../../../utils';

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
    color: ${props => props.theme.palette.text.primary};
    font-weight: ${theme.typography.fontWeightMedium};
  }

  // Fix labels appearing over hamburger menu drawer
  .MuiInputLabel-outlined {
    z-index: auto;
  }
`;

const CountryChecklistWrapper = styled(MuiBox)`
  display: block flex;
  flex-direction: column;
  height: 18.625rem;
`;

/** Matches styling of .MuiFormLabel-root in ui-components TextField */
const StyledFormLabel = styled(MuiFormLabel)`
  font-size: 0.9375rem;
  line-height: 1.125rem;
  margin-bottom: 3px;
`;

const CountryChecklist = styled.fieldset`
  margin: 0;
  padding-block: 0;

  border-radius: 0.1875rem;
  border: 1px solid ${props => props.theme.palette.grey[400]};
  block-size: 100%;
  overflow-y: scroll; /* fallback */
  overflow-block: scroll;
  padding-inline: 0.87rem;
`;

const StyledCheckbox = styled(Checkbox)`
  margin-block: 0;

  .MuiFormControlLabel-root {
    inline-size: 100%;
  }

  .MuiFormControlLabel-label {
    font-size: 0.875rem;
    inline-size: 100%;
    line-height: 1.125rem;
  }
`;

const StyledBox = styled(MuiBox)`
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
  countryIds: Country['id'][];
  reasonForAccess?: string;
}

export const RequestCountryAccessForm = () => {
  const { project } = useCurrentUser();

  const queryResult = useCountryAccessList();
  const countries: TupaiaWebCountryAccessListRequest.ResBody = queryResult.data;
  const accessListIsLoading = queryResult.isLoading;

  const { mutate: requestCountryAccess, isLoading: requestIsLoading } = useRequestProjectAccess({
    onError: error =>
      errorToast(error?.message ?? 'Sorry, couldn’t submit your request. Please try again'),
    onSettled: () => reset(),
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

  const formContext = useForm<RequestCountryAccessFormFields>({
    defaultValues: {
      countryIds: [],
      reasonForAccess: '',
    } as RequestCountryAccessFormFields,
    mode: 'onChange',
  });
  const {
    formState: { isSubmitting, isValidating, isValid },
    handleSubmit,
    register,
    reset,
  } = formContext;

  const applicableCountries = countries?.filter(
    (country: TupaiaWebCountryAccessListRequest.CountryAccess) =>
      project?.names.includes(country.name),
  );

  const submissionShouldBeDisabled =
    isValidating || !isValid || isSubmitting || accessListIsLoading || requestIsLoading;

  function onSubmit(formData: RequestCountryAccessFormFields) {
    requestCountryAccess({
      entityIds: formData.countryIds,
      message: formData.reasonForAccess,
      projectCode: project.code,
    });
  }

  return (
    <StyledForm formContext={formContext} onSubmit={handleSubmit(onSubmit)}>
      <StyledFieldset disabled={isSubmitting || requestIsLoading}>
        <CountryChecklistWrapper>
          <StyledFormLabel>Select countries</StyledFormLabel>
          <CountryChecklist key={countryChecklistKey}>
            {applicableCountries?.map(({ id, name, hasAccess, accessRequests }) => {
              const hasRequestedAccess = accessRequests.includes(project.code);
              const getTooltip = () => {
                if (hasAccess) return 'You already have access';
                if (hasRequestedAccess) return 'Approval in progress';
              };

              return (
                <StyledCheckbox
                  color="primary"
                  disabled={hasAccess || hasRequestedAccess}
                  id="countryIds"
                  inputRef={register({ validate: (value: Country['id'][]) => !!value.length })}
                  key={id}
                  label={name}
                  name="countryIds"
                  tooltip={getTooltip()}
                  value={id}
                />
              );
            })}
          </CountryChecklist>
        </CountryChecklistWrapper>
        <StyledBox>
          <StyledFormInput
            fullWidth
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
            name="reasonForAccess"
            size="medium"
          />
          <Button
            disabled={submissionShouldBeDisabled}
            tooltip={isValid ? undefined : 'Select countries to request access'}
            type="submit"
          >
            {isSubmitting || requestIsLoading ? 'Submitting request' : 'Request access'}
          </Button>
        </StyledBox>
      </StyledFieldset>
    </StyledForm>
  );
};
