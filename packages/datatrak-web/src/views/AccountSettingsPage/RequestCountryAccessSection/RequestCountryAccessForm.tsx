import { FormLabel, Button as MuiButton, Typography } from '@material-ui/core';
import React, { HTMLAttributes, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { Entity } from '@tupaia/types';
import { Form, FormInput, TextField } from '@tupaia/ui-components';

import { useCountryAccessList, useCurrentUserContext, useRequestProjectAccess } from '../../../api';
import { ArrowLeftIcon, Button } from '../../../components';
import { errorToast, successToast, useIsMobile } from '../../../utils';
import { RequestableCountryChecklist } from './RequestableCountryChecklist';

const StyledForm = styled(Form<RequestCountryAccessFormFields>)`
  inline-size: 100%;
  max-inline-size: 44.25rem;
`;

const FieldSet = styled.fieldset`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    display: grid;
    grid-auto-flow: column;
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

const ExpandingFieldSet = styled(FieldSet)`
  transition: 500ms cubic-bezier(0.77, 0, 0.18, 1);
  transition-property: block-size opacity;

  &:not([aria-expanded='true']) {
    block-size: 0;
    opacity: 0;
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
`;

const ExpandButton = styled(MuiButton).attrs({ fullWidth: true })`
  .MuiButton-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const ExpandIcon = styled(ArrowLeftIcon)<{ $active: boolean }>`
  font-size: 1rem;
  transform: rotate(${props => (props.$active ? '-270deg' : '-90deg')});
  transition: transform 300ms cubic-bezier(0.77, 0, 0.18, 1);
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
  // Put margin on tooltip (immediate parent) to avoid disrupting tooltip placement
  *:has(> &) {
    margin-block-start: 1.25rem;
  }
`;

const formLabel = <StyledFormLabel>Select countries</StyledFormLabel>;
const reasonForAccessField = (
  <StyledFormInput id="message" label="Reason for access" name="message" />
);

interface RequestCountryAccessFormFields {
  entityIds: Entity['id'][];
  message?: string;
}

export const RequestCountryAccessForm = (props: HTMLAttributes<HTMLFormElement>) => {
  const { project } = useCurrentUserContext();
  const projectCode = project?.code;
  const { data: countries, isLoading: accessListIsLoading } = useCountryAccessList();

  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

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

  const hasAccessToEveryCountry = countries?.every(c => c.hasAccess) ?? true;
  if (hasAccessToEveryCountry) {
    return <Message>You have access to all available countries within this project</Message>;
  }

  const noRequestableCountries = !project || hasAccessToEveryCountry;
  const formIsSubmitting = isSubmitting || requestIsLoading;
  const disableForm = noRequestableCountries || formIsSubmitting;
  const disableSubmission = disableForm || isValidating || !isValid || accessListIsLoading;

  function onSubmit({ entityIds, message }: RequestCountryAccessFormFields) {
    requestCountryAccess({
      entityIds,
      message,
      projectCode, // Should not be undefined by this point, but TS can’t pick up that form is disabled if project is undefined
    });
  }

  const toggleOpen = () => setIsOpen(!isOpen);

  const getTooltip = () => {
    if (!project) return 'Select a project to request country access';
    if (!isValid) return 'Select countries to request access';
  };

  const requestableCountryChecklistProps = {
    disabled: formIsSubmitting,
    selectedCountries,
    setSelectedCountries,
  };

  const submitButton = (
    <StyledButton disabled={disableSubmission} tooltip={getTooltip()}>
      {formIsSubmitting ? 'Submitting request' : 'Request access'}
    </StyledButton>
  );

  return (
    <StyledForm formContext={formContext} onSubmit={onSubmit} {...props}>
      {isMobile ? (
        <>
          <ExpandButton onClick={toggleOpen}>
            {formLabel}
            <ExpandIcon $active={isOpen} />
          </ExpandButton>
          <ExpandingFieldSet aria-expanded={isOpen} disabled={disableForm}>
            <RequestableCountryChecklist {...requestableCountryChecklistProps} />
            {reasonForAccessField}
          </ExpandingFieldSet>
          {submitButton}
        </>
      ) : (
        <FieldSet disabled={disableForm}>
          <CountryChecklistWrapper>
            {formLabel}
            <RequestableCountryChecklist {...requestableCountryChecklistProps} />
          </CountryChecklistWrapper>
          <Flexbox>
            {reasonForAccessField}
            {submitButton}
          </Flexbox>
        </FieldSet>
      )}
    </StyledForm>
  );
};
