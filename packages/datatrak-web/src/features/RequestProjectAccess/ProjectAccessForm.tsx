/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  DialogActions,
  Typography,
  FormGroup,
  FormControl as BaseFormControl,
  Link,
} from '@material-ui/core';
import { CheckCircle } from '@material-ui/icons';
import {
  Checkbox as BaseCheckbox,
  Form,
  FormInput,
  SpinningLoader,
  TextField,
} from '@tupaia/ui-components';
import { useCountryAccessList } from '../../api/queries';
import { useRequestProjectAccess } from '../../api/mutations';
import { Button } from '../../components';

const FormControl = styled(BaseFormControl).attrs({
  component: 'fieldset',
  required: true,
})`
  border: none;
  padding: 0;
  margin-bottom: 2rem;
`;

const Checkbox = styled(BaseCheckbox).attrs({
  color: 'primary',
})`
  margin: 0;
  font-size: 0.875rem;
  .MuiSvgIcon-root {
    width: 1.2rem;
    height: 1.2rem;
  }
  .MuiFormControlLabel-label span {
    font-size: 0.875rem;
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
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }
  .MuiInputBase-input {
    font-size: 0.875rem;
    padding: 0.875rem;
  }
`;

const Error = styled(Typography).attrs({
  color: 'error',
})`
  margin-bottom: 1rem;
`;

const SuccessWrapper = styled.div`
  display: flex;
  margin-top: 1.5rem;
  margin-bottom: 7rem;
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
  margin-right: 1rem;
  font-size: 2rem;
`;

const LoaderWrapper = styled.div`
  padding: 1rem 0 2rem 0;
`;

interface ProjectAccessFormProps {
  project: any;
  onClose?: () => void;
}

export const ProjectAccessForm = ({ project, onClose }: ProjectAccessFormProps) => {
  const { data: countries } = useCountryAccessList();
  const formContext = useForm({
    mode: 'onChange',
  });
  const { register } = formContext;
  const {
    mutate: requestProjectAccess,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useRequestProjectAccess();

  const { isValid } = formContext.formState;

  // the countries that are applicable to this project
  const projectCountries = countries?.filter((c: any) => project?.names?.includes(c.name));

  const projectCode = project?.code;
  const submitForm = (formData: any) => {
    requestProjectAccess({
      ...formData,
      projectCode,
    });
  };

  // On success, show a success message to the user and direct them back to the projects list
  if (isSuccess)
    return (
      <div>
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
      </div>
    );

  // While the request is being processed, show a loading spinner
  if (isLoading)
    return (
      <LoaderWrapper>
        <SpinningLoader />
      </LoaderWrapper>
    );

  return (
    <Form onSubmit={submitForm as SubmitHandler<any>} formContext={formContext}>
      {isError && <Error>{error.message}</Error>}
      <FormControl>
        <FormGroup>
          {projectCountries?.map((country: any) => {
            const hasRequestedAccess = country.accessRequests.includes(projectCode);
            return (
              <Checkbox
                inputRef={register({
                  validate: v => {
                    return v.length > 0;
                  },
                })}
                label={country.name}
                name="entityIds"
                value={country.id}
                disabled={hasRequestedAccess}
                tooltip={
                  hasRequestedAccess
                    ? 'You have already requested access to this country'
                    : undefined
                }
              />
            );
          })}
        </FormGroup>
      </FormControl>
      <FormInput Input={TextArea} name="message" />
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Back
        </Button>
        <Button
          type="submit"
          disabled={!isValid}
          tooltip={!isValid ? 'Please select one or more countries to proceed' : ''}
        >
          Request Access
        </Button>
      </DialogActions>
    </Form>
  );
};
