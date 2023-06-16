/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import {
  AuthModalButton,
  CheckboxField,
  CheckboxList,
  Form,
  LoadingScreen,
  TextField,
} from '../components';
import { useCountryAccessList } from '../api/queries';
import { useRequestCountryAccess } from '../api/mutations';
import styled from 'styled-components';
import { Link, List, Typography } from '@material-ui/core';

const ADMIN_EMAIL = 'admin@tupaia.org';

const ModalBody = styled.div`
  width: 30rem;
  max-width: 100%;
`;

const AccessRequestWrapper = styled.div`
  margin-bottom: 1rem;
`;

const AccessRequestList = styled(List)`
  list-style-type: none;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  font-size: 1rem;
`;

const Container = styled.div`
  margin: 2rem auto 0;
  width: 22rem;
  max-width: 100%;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 2rem;
  font-weight: 500;
  margin-bottom: 1rem;
`;

export const RequestCountryAccess = () => {
  const formContext = useForm();
  const { data, isLoading: isLoadingList } = useCountryAccessList();

  const getCountriesByAccess = (hasRequests: boolean) => {
    return data?.filter(({ hasAccess, accessRequests }) => {
      return !hasAccess && (hasRequests ? accessRequests.length > 0 : accessRequests.length === 0);
    });
  };

  const countriesWithoutAccess = getCountriesByAccess(false);
  const countriesWithAccessRequests = getCountriesByAccess(true);

  const {
    mutate: requestCountryAccess,
    isLoading: isSubmitting,
    isError,
    error,
    isSuccess,
  } = useRequestCountryAccess();
  return (
    <ModalBody>
      <Title>Request access to countries</Title>
      {isError && <Typography color="error">{error.message}</Typography>}
      <LoadingScreen isLoading={isLoadingList || isSubmitting} />
      {isSuccess ? (
        <Typography>
          Thank you for your country request. We will review your application and respond by email
          shortly.
        </Typography>
      ) : (
        <Container>
          {countriesWithAccessRequests.length > 0 && (
            <AccessRequestWrapper>
              <Typography>You have already requested access to the following countries:</Typography>
              <AccessRequestList>
                {countriesWithAccessRequests.map(({ name }) => (
                  <li key={name}>{name}</li>
                ))}
              </AccessRequestList>
              <Typography>
                This can take some time to process, as requests require formal permission to be
                granted. If you have any questions, please email:{' '}
                <Link href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</Link>
              </Typography>
            </AccessRequestWrapper>
          )}
          <Form formContext={formContext} onSubmit={requestCountryAccess as SubmitHandler<any>}>
            <CheckboxList
              legend="Which countries would you like access to?"
              options={countriesWithoutAccess.map(({ name, id }) => ({
                value: id,
                label: name,
              }))}
              name="entityIds"
            />
            <TextField name="message" label="Why would you like access?" type="text" />
            <AuthModalButton type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
              Request access
            </AuthModalButton>
          </Form>
        </Container>
      )}
    </ModalBody>
  );
};
