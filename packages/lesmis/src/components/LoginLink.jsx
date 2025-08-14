import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import MuiButton from '@material-ui/core/Button';

import { useUrlParams, I18n } from '../utils';

const LoginLinkButton = styled(MuiButton)`
  color: white;
  border-color: white;
  padding: 0.5rem 2rem;
  border-radius: 2.5rem;
`;

export const LoginLink = () => {
  const location = useLocation();
  const { locale } = useUrlParams();

  return (
    <LoginLinkButton
      variant="outlined"
      component={RouterLink}
      to={`/${locale}/login`}
      state={{ referer: `${location.pathname}${location.search}` }}
      className="login-link"
    >
      <I18n t="home.logIn" />
    </LoginLinkButton>
  );
};
