/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Alert } from '@tupaia/ui-components';
import { useUser } from '../api/queries';

export const LandingPage = () => {
  const { data: user, isLoggedIn } = useUser();
  return (
    <>
      <Alert>
        <p>{isLoggedIn ? `Logged in as ${user?.name}` : 'You are not logged in'}</p>
      </Alert>
      <h1>Hello world</h1>
    </>
  );
};
