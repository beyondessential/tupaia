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

const TextButton = styled(MuiButton)`
  margin-right: 10px;
  color: white;
`;

export const SignUpLink = () => {
  const history = useHistory();
  const { locale } = useUrlParams();

  return (
    <TextButton
      component={RouterLink}
      to={{
        pathname: `/${locale}/register`,
        state: { referer: history.location },
      }}
    >
      <I18n t="home.signUp" />
    </TextButton>
  );
};
