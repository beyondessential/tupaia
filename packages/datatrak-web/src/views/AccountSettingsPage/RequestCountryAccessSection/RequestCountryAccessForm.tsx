/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Box, FormLabel, useMediaQuery } from '@material-ui/core';
import { Button, Checkbox, Form, FormInput, TextField } from '@tupaia/ui-components';
import { theme } from '../../../theme';
import { useCountryAccessList, useCurrentUser, useRequestProjectAccess } from '../../../api';

const gridAndFlexGap = '1.25rem';

const StyledForm = styled(Form)`
  width: 100%;
  ${theme.breakpoints.up('md')} {
    max-width: 44.25rem;
  }
`;

const StyledFieldset = styled.fieldset`
  border: none;
  margin: 0;
  padding: 0;

  display: grid;
  gap: ${gridAndFlexGap};
  grid-auto-flow: column;
  grid-template: auto auto / auto;

  ${theme.breakpoints.up('sm')} {
    grid-template: auto / 1fr 1fr;
  }

  .MuiFormLabel-root {
    color: ${props => props.theme.palette.text.primary};
    font-weight: ${theme.typography.fontWeightMedium};
  }

  // Fix labels appearing over hamburger menu drawer (in md and sm size classes)
  .MuiInputLabel-outlined {
    z-index: auto;
  }
`;

const CountryListWrapper = styled(Box)`
  display: block flex;
  flex-direction: column;
  height: 18.625rem;
`;

/** Matches styling of .MuiFormLabel-root in ui-components TextField */
const StyledFormLabel = styled(FormLabel)`
  font-size: 0.9375rem;
  line-height: 1.125rem;
  margin-bottom: 3px;
`;

const CountryList = styled.fieldset`
  margin: 0;

  border-radius: 0.1875rem;
  border: 1px solid ${props => props.theme.palette.grey[400]};
  overflow-y: scroll;
  padding-block: 0;
  padding-inline: 0.87rem;
`;

const StyledCheckbox = styled(Checkbox)`
  margin-block: 0;

  .MuiFormControlLabel-root {
    width: 100%;
  }

  .MuiFormControlLabel-label {
    font-size: 0.875rem;
    line-height: 1.125rem;
    width: 100%;
  }
`;

const StyledBox = styled(Box)`
  display: block flex;
  flex-direction: column;
  gap: ${gridAndFlexGap};
`;

// Usage of this component below has inline styling. See there for explanation.
const StyledFormInput = styled(FormInput)`
  flex-grow: 1;
  margin: 0;

  .MuiInputBase-root {
    align-items: start;
    height: 100%;
    max-height: 100%;
  }

  .MuiInputBase-input {
    box-sizing: border-box;
  }
`;

export const RequestCountryAccessForm = () => {
  const { project } = useCurrentUser();
  const { data: countries, isLoading } = useCountryAccessList();
  const { mutate: requestCountryAccess } = useRequestProjectAccess();
  const sizeClassIsMdOrLarger = useMediaQuery(theme.breakpoints.up('sm'));

  const formContext = useForm();
  const {
    formState: { isSubmitting },
    handleSubmit,
    // reset,
  } = formContext;

  const applicableCountries = countries?.filter((c: any) => project?.names.includes(c.name));
  console.log(applicableCountries);

  function onSubmit() {
    // const countryIds: Country[] = [];
    // requestCountryAccess({ entityIds: countryIds, message: '', projectCode: project?.code });
  }

  return (
    <StyledForm formContext={formContext} onSubmit={handleSubmit(onSubmit)}>
      <StyledFieldset>
        <CountryListWrapper>
          <StyledFormLabel>Select countries</StyledFormLabel>
          <CountryList>
            {countries?.map(({ id, name, hasAccess, accessRequests }) => {
              const hasRequestedAccess = accessRequests.includes(project!.code); // HACK: Avoid non-null assertion operator
              const getTooltip = () => {
                if (hasAccess) return 'You already have access';
                if (hasRequestedAccess) return 'Approval in progress';
              };

              return (
                <StyledCheckbox
                  color="primary"
                  disabled={hasAccess || hasRequestedAccess}
                  id={name}
                  key={id}
                  label={name}
                  name={name}
                  tooltip={getTooltip()}
                />
              );
            })}
          </CountryList>
        </CountryListWrapper>
        <StyledBox>
          <StyledFormInput
            defaultValue=""
            fullWidth
            Input={TextField}
            inputProps={{
              enterKeyHint: 'done',
              // Make <textarea> scroll upon overflow. MUI uses inline styling (element.style) to
              // dynamically resize it to fit content, so we must do the same to override it.
              style: sizeClassIsMdOrLarger ? { height: '100%' } : {},
            }}
            label="Reason for access"
            margin="none"
            multiline
            name="reasonForAccess"
            size="medium"
          />
          <Button disabled={isSubmitting || isLoading} type="submit">
            Request access
          </Button>
        </StyledBox>
      </StyledFieldset>
    </StyledForm>
  );
};
