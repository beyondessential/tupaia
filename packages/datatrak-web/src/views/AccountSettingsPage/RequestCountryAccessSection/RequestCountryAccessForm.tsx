import React, { useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { UseQueryResult } from '@tanstack/react-query';
import {
  FormLabel,
  Typography,
  Button as MuiButton,
  Collapse as UICollapse,
} from '@material-ui/core';
import { Entity, ProjectCountryAccessListRequest, ProjectResponse } from '@tupaia/types';
import { Form, FormInput, TextField } from '@tupaia/ui-components';
import { useRequestProjectAccess } from '../../../api';
import { Button, ArrowLeftIcon } from '../../../components';
import { errorToast, successToast, useIsMobile } from '../../../utils';
import { RequestableCountryChecklist } from './RequestableCountryChecklist';

const StyledForm = styled(Form)`
  inline-size: 100%;
  max-inline-size: 44.25rem;
`;

const StyledFieldset = styled.fieldset`
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

const Collapse = styled(UICollapse)`
  padding-bottom: 2rem;
  .MuiCollapse-wrapper {
    width: 100%;
  }
`;

const ExpandButton = styled(MuiButton)<{ $active: boolean }>`
  width: 100%;
  .MuiButton-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  svg {
    transform: rotate(${props => (props.$active ? '-270deg' : '-90deg')});
    font-size: 1rem;
  }
`;

// Usage of this component has inline styling. See there for explanation.
const StyledFormInput = styled(FormInput).attrs({
  fullWidth: true,
  multiline: true,
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

const ReasonForAccessField = () => {
  return (
    <StyledFormInput
      id="message"
      Input={TextField}
      rows={6}
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
        style: { height: '100%', overflow: 'auto' },
      }}
      label="Reason for access"
      name="message"
    />
  );
};

interface RequestCountryAccessFormProps {
  countryAccessList: UseQueryResult<ProjectCountryAccessListRequest.ResBody>;
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
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: countries, isLoading: accessListIsLoading } = countryAccessList;
  const projectCode = project?.code;

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

  const hasAccessToEveryCountry = (countries ?? []).every(c => c.hasAccess);
  const noRequestableCountries = !project || hasAccessToEveryCountry;

  const formIsSubmitting = isSubmitting || requestIsLoading;
  const formIsInsubmissible = isValidating || !isValid || accessListIsLoading || formIsSubmitting;

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
    return isValid ? undefined : 'Select countries to request access';
  };

  if (hasAccessToEveryCountry) {
    return <Message>You have access to all available countries within this project.</Message>;
  }

  if (isMobile) {
    return (
      <StyledForm formContext={formContext} onSubmit={handleSubmit(onSubmit)}>
        <ExpandButton onClick={toggleOpen} $active={isOpen}>
          <StyledFormLabel>Select countries</StyledFormLabel>
          <ArrowLeftIcon />
        </ExpandButton>
        <Collapse in={isOpen}>
          <StyledFieldset disabled={noRequestableCountries || formIsSubmitting}>
            <RequestableCountryChecklist
              projectCode={projectCode}
              countries={countries}
              disabled={formIsSubmitting}
              selectedCountries={selectedCountries}
              setSelectedCountries={setSelectedCountries}
            />
            <ReasonForAccessField />
          </StyledFieldset>
        </Collapse>
        <Button
          disabled={noRequestableCountries || formIsInsubmissible}
          tooltip={getTooltip()}
          tooltipDelay={0}
          type="submit"
          fullWidth
        >
          {formIsSubmitting ? 'Submitting request' : 'Request access'}
        </Button>
      </StyledForm>
    );
  }

  return (
    <StyledForm formContext={formContext} onSubmit={handleSubmit(onSubmit)}>
      <StyledFieldset disabled={noRequestableCountries || formIsSubmitting}>
        <CountryChecklistWrapper>
          <StyledFormLabel>Select countries</StyledFormLabel>
          <RequestableCountryChecklist
            projectCode={projectCode}
            countries={countries}
            disabled={formIsSubmitting}
            selectedCountries={selectedCountries}
            setSelectedCountries={setSelectedCountries}
          />
        </CountryChecklistWrapper>
        <Flexbox>
          <ReasonForAccessField />
          <Button
            disabled={noRequestableCountries || formIsInsubmissible}
            tooltip={getTooltip()}
            tooltipDelay={0}
            type="submit"
          >
            {formIsSubmitting ? 'Submitting request' : 'Request access'}
          </Button>
        </Flexbox>
      </StyledFieldset>
    </StyledForm>
  );
};
