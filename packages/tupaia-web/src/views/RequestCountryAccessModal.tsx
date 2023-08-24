/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useParams } from 'react-router';
import styled from 'styled-components';
import { Link, List, Typography } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { AuthModalButton, CheckboxList, Form, LoadingScreen, TextField } from '../components';
import { useCountryAccessList, useProject } from '../api/queries';
import { useRequestCountryAccess } from '../api/mutations';

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

export const RequestCountryAccessModal = () => {
  const formContext = useForm();
  const { projectCode } = useParams();
  const { data, isLoading: isLoadingList, isFetching } = useCountryAccessList();
  const { isLoading: isLoadingProject } = useProject(projectCode);

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
      {/** The project access modal should take precedence over the country access one, so just in case the project has not finished loading, and the user is directed to the project access modal because the don't have permissions for the selected project, we will show a loading screen so that the transition is smooth for the user */}

      {isLoadingProject ? (
        <SpinningLoader />
      ) : (
        <>
          <Title>Request access to countries</Title>
          {isError && <Typography color="error">{error.message}</Typography>}
          <LoadingScreen isLoading={isLoadingList || isFetching || isSubmitting} />
          {isSuccess ? (
            <Typography>
              Thank you for your country request. We will review your application and respond by
              email shortly.
            </Typography>
          ) : (
            <Container>
              {countriesWithAccessRequests?.length > 0 && (
                <AccessRequestWrapper>
                  <Typography>
                    You have already requested access to the following countries:
                  </Typography>
                  <AccessRequestList>
                    {countriesWithAccessRequests?.map(({ name }) => (
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
                {countriesWithoutAccess?.length > 0 && (
                  <CheckboxList
                    legend="Which countries would you like access to?"
                    options={countriesWithoutAccess?.map(({ name, id }) => ({
                      value: id,
                      label: name,
                    }))}
                    required
                    name="entityIds"
                  />
                )}
                <TextField
                  name="message"
                  label="Why would you like access?"
                  type="text"
                  multiline
                  rowsMax={4}
                />
                <AuthModalButton type="submit" disabled={isSubmitting}>
                  Request access
                </AuthModalButton>
              </Form>
            </Container>
          )}
        </>
      )}
    </ModalBody>
  );
};
