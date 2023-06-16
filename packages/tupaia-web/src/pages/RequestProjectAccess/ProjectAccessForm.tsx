/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import { CountryAccessListItem, SingleProject } from '../../types';
import { CheckboxList, Form, LoadingScreen, TextField } from '../../components';
import { useRequestCountryAccess } from '../../api/mutations';
import { Alert } from '@material-ui/lab';
import styled from 'styled-components';

const Note = styled.p`
  text-align: left;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: small;
`;

interface ProjectCountryFormProps {
  availableCountries: CountryAccessListItem[];
  projectName: SingleProject['name'];
}

export const ProjectAccessForm = ({ availableCountries, projectName }: ProjectCountryFormProps) => {
  const formContext = useForm();

  const {
    mutate: requestCountryAccess,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useRequestCountryAccess();

  if (isError) return <Typography color="error">{error.message}</Typography>;

  if (isSuccess)
    return (
      <>
        <Alert severity="success">
          Thank you for your access request to {projectName}. We will review your application and
          respond by email shortly.
        </Alert>
        <Note>
          Note: This can take some time to process, as requests require formal permission to be
          granted.
        </Note>
        {/* <BackButton onClick={onBackToProjects}>Back to Projects</BackButton> */}
      </>
    );

  return (
    <Form formContext={formContext} onSubmit={requestCountryAccess as SubmitHandler<any>}>
      <LoadingScreen isLoading={isLoading} />;
      {availableCountries.length > 0 && (
        <CheckboxList
          legend="Which countries would you like access to?"
          options={availableCountries.map(({ name, id }) => ({
            value: id,
            label: name,
          }))}
          name="countries"
        />
      )}
      <TextField name="message" label="Why would you like access to this project?" type="text" />
    </Form>
  );
};
