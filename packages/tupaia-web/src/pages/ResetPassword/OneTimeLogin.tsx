/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { RouterLink } from '../../components';
import { MODAL_ROUTES, PASSWORD_RESET_TOKEN_PARAM } from '../../constants';
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
  // Do one time login
  useEffect(() => {
    attemptLogin();
  }, []);

  return (
    <>
      {isError && (
        <Alert severity="warning">
          <Typography>The email link has expired or already been used.</Typography>
          <Link modal={MODAL_ROUTES.FORGOT_PASSWORD} removeParams={[PASSWORD_RESET_TOKEN_PARAM]}>
            Click here to request a new reset password link.
          </Link>
        </Alert>
      )}
    </>
  );
};
