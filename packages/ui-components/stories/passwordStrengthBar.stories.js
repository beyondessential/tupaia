/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { lazy, useState } from 'react';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { TextField, PasswordStrengthBar } from '../src/components';
import * as COLORS from './story-utils/theme/colors';

// Lazy load the password strength library as it uses zxcvbn which is a large dependency.
// For more about lazy loading components @see: https://reactjs.org/docs/code-splitting.html#reactlazy
const StrengthBarComponent = lazy(() => import('react-password-strength-bar'));

export default {
  title: 'PasswordStrengthBar',
  component: PasswordStrengthBar,
};

const Container = styled(MuiBox)`
  max-width: 600px;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY};
`;

export const Simple = () => {
  const [password, setPassword] = useState('');
  return (
    <Container>
      <TextField
        label="Password"
        name="password"
        type="password"
        value={password}
        onChange={event => setPassword(event.target.value)}
      />
      <PasswordStrengthBar
        password={password}
        StrengthBarComponent={StrengthBarComponent}
        helperText="New password must be over 8 characters long."
        pt={1}
        pb={3}
      />
    </Container>
  );
};
