/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { CountryAccessListItem, SingleProject } from '../../types';
import {
  CheckboxList,
  Form as BaseForm,
  LoadingScreen,
  TextField,
  AuthModalButton,
  RouterButton,
  Alert,
} from '../../components';
import { useRequestCountryAccess } from '../../api/mutations';
import styled from 'styled-components';
import { MODAL_ROUTES, PROJECT_PARAM } from '../../constants';

const Note = styled.p`
  text-align: left;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: small;
  margin-bottom: 2rem;
`;

const Form = styled(BaseForm)`
  legend {
    text-align: left;
  }
`;

const Error = styled(Typography).attrs({
  color: 'error',
})`
  margin-bottom: 1rem;
`;

const AlertText = styled(Typography)`
  text-align: left;
  font-size: inherit;
`;

interface ProjectCountryFormProps {
  availableCountries: CountryAccessListItem[];
  projectName: SingleProject['name'];
}

export const ProjectAccessForm = ({ availableCountries, projectName }: ProjectCountryFormProps) => {
  const formContext = useForm({
    mode: 'onChange',
  });

  const { isValid } = formContext.formState;

  const {
    mutate: requestCountryAccess,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useRequestCountryAccess();

  if (isSuccess)
    return (
      <div>
        <Alert severity="success">
          <AlertText>
            Thank you for your access request to {projectName}. We will review your application and
            respond by email shortly.
          </AlertText>
        </Alert>
        <Note>
          Note: This can take some time to process, as requests require formal permission to be
          granted.
        </Note>
        <AuthModalButton
          component={RouterButton}
          modal={MODAL_ROUTES.PROJECTS}
          removeParams={[PROJECT_PARAM]}
        >
          Back to Projects
        </AuthModalButton>
      </div>
    );

  return (
    <Form formContext={formContext} onSubmit={requestCountryAccess as SubmitHandler<any>}>
      {isError && <Error>{error.message}</Error>}
      <LoadingScreen isLoading={isLoading} />
      {availableCountries.length > 0 && (
        <CheckboxList
          legend="Which countries would you like access to?"
          options={availableCountries.map(({ name, id }) => ({
            value: id,
            label: name,
          }))}
          name="entityIds"
          required
        />
      )}
      <TextField name="message" label="Why would you like access to this project?" type="text" />
      <AuthModalButton type="submit" disabled={!isValid}>
        Request Access
      </AuthModalButton>
    </Form>
  );
};
