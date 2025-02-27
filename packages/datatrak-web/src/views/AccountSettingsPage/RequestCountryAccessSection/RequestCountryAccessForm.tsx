import { FormLabel, Typography } from '@material-ui/core';
import React, { HTMLAttributes, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled, { css } from 'styled-components';

import { Entity } from '@tupaia/types';
import { Form, FormInput, TextField } from '@tupaia/ui-components';

import { useCountryAccessList, useCurrentUserContext, useRequestProjectAccess } from '../../../api';
import { Button } from '../../../components';
import { TooltipButtonWrapper } from '../../../components/Button';
import { errorToast, successToast } from '../../../utils';
import { AdaptiveCollapse } from './AdaptiveCollapse';
import { RequestableCountryChecklist } from './RequestableCountryChecklist';

const StyledForm = styled(Form<RequestCountryAccessFormFields>)`
  inline-size: 100%;
  ${props => props.theme.breakpoints.up('md')} {
    max-inline-size: 44.25rem;
  }
`;

const FieldSet = styled.fieldset(props => {
  const { breakpoints, palette, typography } = props.theme;
  return css`
    ${breakpoints.up('sm')} {
      block-size: 18.32rem;
      column-gap: 1.25rem;
      display: grid;
      grid-template-areas:
        '--heading   --reason'
        '--checklist --reason'
        '--checklist --submit';
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto 1fr auto;
    }

    .MuiFormLabel-root {
      color: ${palette.text.primary};
      font-weight: ${typography.fontWeightMedium};
    }

    // Fix labels appearing over hamburger menu drawer
    .MuiInputLabel-outlined {
      z-index: auto;
    }
  `;
});

/** Matches styling of `.FormLabel-root` in ui-components `TextField` */
const StyledFormLabel = styled(FormLabel)`
  font-size: 0.9375rem;
  line-height: 1.125rem;
  margin-block-end: 0.1875rem;
`;

const StyledFormInput = styled(FormInput).attrs({
  Input: TextField,
  fullWidth: true,
  inputProps: {
    enterKeyHint: 'done',
    /*
     * Make `<textarea>` scroll upon overflow.
     *
     * MUI uses inline styling (element.style) to resize `<textarea>`s to fit an integer
     * number of lines. This behaviour is desirable in single-column layouts, which we use
     * in smaller size classes. In a multi-column grid it causes misalignment, so we
     * override it, also with inline styling.
     */
    style: { blockSize: '100%', overflow: 'auto' },
  },
  multiline: true,
  rows: 6,
})`
  grid-area: --reason;
  margin: 0;

  .MuiInputBase-root {
    align-items: start;
    block-size: 100%;
    max-block-size: 100%;
  }

  .MuiInputBase-input {
    box-sizing: border-box;
  }
  .MuiOutlinedInput-inputMultiline {
    padding: 1rem;
  }
  ${({ theme }) => theme.breakpoints.up('sm')} {
    block-size: 100%;
  }
`;

const Message = styled(Typography)`
  font-size: 0.875rem;
  font-weight: 400;
  text-align: left;
  margin-block-end: 1rem;
  width: 100%;

  ${({ theme }) => theme.breakpoints.up('md')} {
    text-align: center;
    margin: 0;
    font-weight: 500;
    font-size: 1.1125rem;
    flex: 1;
    align-self: center;
  }
`;

const StyledButton = styled(Button).attrs({
  fullWidth: true,
  tooltipDelay: 0,
  type: 'submit',
})`
  // Put margin on tooltip (if present) to avoid disrupting tooltip placement
  ${props => (props.tooltip ? `${TooltipButtonWrapper}:has(> &)` : '&')} {
    grid-area: --submit;
    margin-block-start: 1.25rem;
  }
`;

export interface RequestCountryAccessFormFields {
  entityIds: Entity['id'][];
  message?: string;
}

export const RequestCountryAccessForm = (props: HTMLAttributes<HTMLFormElement>) => {
  const { project } = useCurrentUserContext();
  const projectCode = project?.code;
  const {
    data: countries,
    isLoading: accessListIsLoading,
    isInitialLoading: accessListIsInitialLoading,
  } = useCountryAccessList();

  const formContext = useForm<RequestCountryAccessFormFields>({
    defaultValues: {
      entityIds: [],
      message: '',
    },
    mode: 'onChange',
  });
  const {
    formState: { isSubmitting, isValidating, isValid },
    reset,
  } = formContext;

  /*
   * Semantically, this belongs in `RequestableCountryChecklist` (child of this component), but
   * `setSelectedCountries` is used here to circumvent some quirks of how React Hook Form +
   * MUI checkboxes (mis-)handle multiple checkboxes with the same control name.
   */
  const [selectedCountries, setSelectedCountries] = useState<Entity['id'][]>([]);
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

  const hasAccessToEveryCountry = !accessListIsInitialLoading && countries?.every(c => c.hasAccess);
  if (hasAccessToEveryCountry) {
    return <Message>You have access to all available countries within this project</Message>;
  }

  const formIsSubmitting = isSubmitting || requestIsLoading;
  const disableForm = !project || formIsSubmitting;
  const disableSubmission = disableForm || isValidating || !isValid || accessListIsLoading;

  function onSubmit({ entityIds, message }: RequestCountryAccessFormFields) {
    requestCountryAccess({
      entityIds,
      message,
      projectCode, // Should not be undefined by this point, but TS can’t pick up that form is disabled if project is undefined
    });
  }

  const getTooltip = () => {
    if (!project) return 'Select a project to request country access';
    if (!isValid) return 'Select countries to request access';
  };

  return (
    <StyledForm formContext={formContext} onSubmit={onSubmit} {...props}>
      <FieldSet disabled={disableForm}>
        <AdaptiveCollapse
          label={<StyledFormLabel>Select countries</StyledFormLabel>}
          name="collapsible-country-checklist"
        >
          <RequestableCountryChecklist
            disabled={formIsSubmitting}
            selectedCountries={selectedCountries}
            setSelectedCountries={setSelectedCountries}
            style={{ gridArea: '--checklist' }}
          />
          <StyledFormInput id="message" label="Reason for access" name="message" />
        </AdaptiveCollapse>
        <StyledButton disabled={disableSubmission} tooltip={getTooltip()}>
          {formIsSubmitting ? 'Submitting request' : 'Request access'}
        </StyledButton>
      </FieldSet>
    </StyledForm>
  );
};
