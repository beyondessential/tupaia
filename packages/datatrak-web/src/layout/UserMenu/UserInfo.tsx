/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button, RouterLink } from '@tupaia/ui-components';
import { useUser } from '../../api/queries';
import { MOBILE_BREAKPOINT, ROUTES } from '../../constants';

const Wrapper = styled.div`
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

const AuthLink = styled(Button).attrs({
  color: 'default',
  component: RouterLink,
})``;

const LoginLink = styled(AuthLink).attrs({
  variant: 'outlined',
})`
  border-radius: 4rem;
  border-color: ${props => props.theme.palette.text.primary};
`;

export const UserInfo = () => {
  const { isLoggedIn, data } = useUser();
  return (
    <Wrapper>
      {isLoggedIn ? (
        <Typography>{data?.name}</Typography>
      ) : (
        <>
          <AuthLink variant="text" to={ROUTES.REGISTER}>
            Register
          </AuthLink>
          <LoginLink to={ROUTES.LOGIN}>Login</LoginLink>
        </>
      )}
    </Wrapper>
  );
};
