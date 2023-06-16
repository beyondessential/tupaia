/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { LoadingScreen, RouterLink } from '../../components';
import { useOneTimeLogin } from '../../api/mutations';
import { MODAL_ROUTES, PASSWORD_RESET_TOKEN_PARAM } from '../../constants';
import { useSearchParams } from 'react-router-dom';
import { Alert as MuiAlert } from '@material-ui/lab';

const Link = styled(RouterLink)`
  font-size: 1rem;
  color: ${props => props.theme.palette.primary.main};
`;

const Alert = styled(MuiAlert)`
  margin-top: 1rem;
`;

interface OneTimeLoginProps {
  attemptLogin: () => void;
  isError: boolean;
}

export const OneTimeLogin = ({ attemptLogin, isError }: OneTimeLoginProps) => {
  const [urlParams] = useSearchParams();

  urlParams.delete(PASSWORD_RESET_TOKEN_PARAM);
  const urlParamsValues = [...urlParams.values()];
  const forgotPasswordUrl = `#${MODAL_ROUTES.FORGOT_PASSWORD}${
    urlParamsValues.length ? `?${urlParams.toString()}` : ''
  }`;
  // Do one time login
  useEffect(() => {
    attemptLogin();
  }, []);

  return (
    <>
      {isError && (
        <Alert severity="warning">
          <Typography>The email link has expired or already been used.</Typography>
          <Link to={forgotPasswordUrl}>Click here to request a new reset password link.</Link>
        </Alert>
      )}
    </>
  );
};
