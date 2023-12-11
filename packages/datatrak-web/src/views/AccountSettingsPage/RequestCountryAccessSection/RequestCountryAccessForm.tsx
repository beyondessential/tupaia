/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { Box, FormLabel } from '@material-ui/core';
import { Button, Checkbox, Form, FormInput, TextField } from '@tupaia/ui-components';
import { useCountryAccessList } from '../../../api';

const gridAndFlexGap = '1.25rem';

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

  display: grid;
  gap: ${gridAndFlexGap};
  grid-auto-flow: column;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    grid-template: auto / 1fr 1fr;
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

const CountryListWrapper = styled(Box)`
  display: block flex;
  flex-direction: column;
  height: 20.125rem;
`;

/** Match styling of .MuiFormLabel-root in ui-components TextField */
const StyledFormLabel = styled(FormLabel)`
  font-size: 0.9375rem;
  line-height: 1.125rem;
  margin-bottom: 3px;
`;

const CountryList = styled.fieldset`
  border: none;
  margin: 0;

  border-radius: 0.1875rem;
  border: 1px solid ${props => props.theme.palette.divider};
  overflow-y: scroll;
  padding: 0 0.87rem;
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

/** The usage of this component below has inline styling. See there for explanation */
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
  const formContext = useForm();
  const { data: countryAccessList } = useCountryAccessList();

  return (
    <StyledForm formContext={formContext}>
      <StyledFieldset>
        <CountryListWrapper>
          <StyledFormLabel>Select countries</StyledFormLabel>
          <CountryList>
            {countryAccessList?.map(country => (
              <StyledCheckbox
                color="primary"
                disabled={!!country.accessRequests}
                key={country.id}
                name={country.name}
                label={country.name}
                tooltip={country.accessRequests ? 'Approval in progress' : null}
              />
            ))}
          </CountryList>
        </CountryListWrapper>
        <StyledBox>
          <StyledFormInput
            fullWidth
            Input={TextField}
            inputProps={{
              enterKeyHint: 'done',
              // MUI uses inline styling (element.style) to dynamically resize <textarea> to fit
              // content, so we must do the same to override it. This makes it scroll upon overflow.
              style: { height: '100%' },
            }}
            label="Reason for access"
            margin="none"
            multiline
            name="reasonForAccess"
            size="medium"
            // sx={{ height: 100 }}
          />
          <Button>Request access</Button>
        </StyledBox>
      </StyledFieldset>
    </StyledForm>
  );
};
