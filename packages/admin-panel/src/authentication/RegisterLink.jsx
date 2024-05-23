/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link } from '@material-ui/core';

const requestAnAccountUrl = 'https://info.tupaia.org/contact';

export const RegisterLink = () => {
  return (
    <Link href={requestAnAccountUrl} target="_blank">
      Request an account here
    </Link>
  );
};
