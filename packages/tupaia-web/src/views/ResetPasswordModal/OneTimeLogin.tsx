import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Alert as BaseAlert } from '@tupaia/ui-components';
import { RouterLink } from '../../components';
import { MODAL_ROUTES, URL_SEARCH_PARAMS } from '../../constants';

const Link = styled(RouterLink)`
  font-size: 1rem;
  color: ${props => props.theme.palette.primary.main};
`;

const Alert = styled(BaseAlert)`
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
          <Link
            modal={MODAL_ROUTES.FORGOT_PASSWORD}
            searchParamsToRemove={[URL_SEARCH_PARAMS.PASSWORD_RESET_TOKEN]}
          >
            Click here to request a new reset password link.
          </Link>
        </Alert>
      )}
    </>
  );
};
