/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  DialogActions,
  FormControl as BaseFormControl,
  FormGroup,
  Typography,
} from '@material-ui/core';
import { CheckCircle } from '@material-ui/icons';
import { WebServerProjectRequest } from '@tupaia/types';
import { Checkbox as BaseCheckbox, SpinningLoader, TextField, Button } from '../../components';
import { Form, FormInput } from '../Form';

const FormControl = styled(BaseFormControl).attrs({
  component: 'fieldset',
  required: true,
})`
  margin-block-end: 2rem;
`;

const Checkbox = styled(BaseCheckbox).attrs({
  color: 'primary',
})`
  margin: 0;

  &,
  .MuiFormControlLabel-label span // When checkbox has a tooltip
  {
    font-size: 0.875rem;
  }

  .MuiSvgIcon-root {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const TextArea = styled(TextField).attrs({
  label: 'Why would you like access to this project?',
  type: 'text',
  multiline: true,
  rows: 4,
})`
  .MuiFormLabel-root {
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 0.875rem;
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    margin-block-end: 0.5rem;
  }
  .MuiInputBase-input {
    font-size: 0.875rem;
    padding: 0.875rem;
  }
  .MuiInputBase-root {
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
  // we have to override this here as there are selectors inside ui-components with higher specificity than we can achieve via the theme overrides
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    box-shadow: none;
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const SuccessWrapper = styled.div`
  display: flex;
  margin-block: 1.5rem 7rem;
  p:first-child {
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    margin-bottom: 0.5rem;
  }
  p:last-child {
    font-size: 0.875rem;
  }
`;

const SuccessIcon = styled(CheckCircle)`
  color: ${({ theme }) => theme.palette.success.main};
  font-size: 2rem;
  margin-inline-end: 1rem;
`;

const LoaderWrapper = styled.div`
  padding: 1rem 0 2rem 0;
`;

/** Fixes janky spacing changes when 'Request access' button is enabled or disabled */
const StyledDialogActions = styled(DialogActions)`
  gap: 1rem;

  & > :not(:first-child) {
    margin-inline-start: 0;
  }
`;

const FormButton = styled(Button)`
  text-transform: none;
`;

type Country = {
  id: string;
  name: string;
  hasPendingAccess: boolean;
};

interface ProjectAccessFormProps {
  project?: WebServerProjectRequest.ResBody;
  onClose?: () => void;
  countries: Country[];
  onSubmit: (data: { entityIds: string[]; message: string; projectCode: string }) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
}

export const ProjectAccessForm = ({
  project,
  onClose,
  countries,
  onSubmit,
  isSubmitting,
  isSuccess,
}: ProjectAccessFormProps) => {
  const formContext = useForm({
    mode: 'onChange',
  });
  const {
    formState: { isValid },
    register,
  } = formContext;

  const projectCode = project?.code;
  const submitForm = (formData: any) => {
    onSubmit({
      ...formData,
      projectCode,
    });
  };

  // On success, show a success message to the user and direct them back to the projects list
  if (isSuccess)
    return (
      <>
        <SuccessWrapper>
          <SuccessIcon />
          <div>
            <Typography>Thank you for your request to {project?.name}</Typography>
            <Typography>
              We will review your application and respond by email shortly. Please note, this can
              take some time to process as requests require formal permission to be granted
            </Typography>
          </div>
        </SuccessWrapper>

        <DialogActions>
          <Button onClick={onClose}>Back to Projects</Button>
        </DialogActions>
      </>
    );

  // While the request is being processed, show a loading spinner
  if (isSubmitting)
    return (
      <LoaderWrapper>
        <SpinningLoader />
      </LoaderWrapper>
    );

  return (
    <Form onSubmit={submitForm as SubmitHandler<any>} formContext={formContext}>
      <FormControl>
        <FormGroup>
          {countries?.map(({ id, name, hasPendingAccess }) => {
            return (
              <Checkbox
                id={id}
                inputRef={register({ validate: value => value.length > 0 })}
                disabled={hasPendingAccess}
                key={id}
                label={name}
                name="entityIds"
                value={id}
                tooltip={
                  hasPendingAccess ? 'You have already requested access to this country' : undefined
                }
              />
            );
          })}
        </FormGroup>
      </FormControl>
      <FormInput Input={TextArea} name="message" />
      <StyledDialogActions>
        <FormButton variant="text" onClick={onClose} color="default">
          Back
        </FormButton>
        <FormButton
          type="submit"
          disabled={!isValid}
          tooltip={isValid ? undefined : 'Select one or more countries to proceed'}
        >
          Request access
        </FormButton>
      </StyledDialogActions>
    </Form>
  );
};
