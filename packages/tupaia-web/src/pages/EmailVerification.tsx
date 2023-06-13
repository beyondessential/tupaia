/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useEmailVerification } from '../api/queries';
import { DEFAULT_URL, MODAL_ROUTES } from '../constants';

const Success = styled(Typography)`
  color: ${({ theme }) => theme.palette.success.main};
`;

const Error = styled(Typography)`
  color: ${({ theme }) => theme.palette.error.main};
`;

export const EmailVerification = () => {
  const { isSuccess, isError } = useEmailVerification();

  if (isSuccess) return <Success>Your e-mail was successfully verified</Success>;
  if (isError) return <Error>Your email address could not be verified</Error>;
  return null;
};

/*
 * Email verification links redirect to the login page where the verification happens
 */
export const EmailVerificationRoute = () => {
  let location = useLocation();
  const [searchParams] = useSearchParams();
  searchParams.set('modal', MODAL_ROUTES.LOGIN);
  const queryString = searchParams.toString();
  return <Navigate to={{ ...location, pathname: DEFAULT_URL, search: queryString }} replace />;
};
