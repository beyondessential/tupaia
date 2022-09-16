/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import MuiButton from '@material-ui/core/Button';

import { useUrlParams, I18n } from '../utils';

const LoginLinkButton = styled(MuiButton)`
  color: white;
  border-color: white;
  padding: 0.5rem 2rem;
  border-radius: 2.5rem;
`;

export const LoginLink = () => {
  const history = useHistory();
  const { locale } = useUrlParams();

  return (
    <LoginLinkButton
      variant="outlined"
      component={RouterLink}
      to={{
        pathname: `/${locale}/login`,
        state: { referer: history.location },
      }}
    >
      <I18n t="home.logIn" />
    </LoginLinkButton>
  );
};
