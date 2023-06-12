/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import Typography from '@material-ui/core/Typography';
import { useEmailVerification } from '../api/queries';
import styled from 'styled-components';

const Success = styled(Typography)`
  color: ${({ theme }) => theme.palette.success.main};
`;

const Error = styled(Typography)`
  color: ${({ theme }) => theme.palette.error.main};
`;

export const EmailVerification = () => {
  const { isSuccess, isError } = useEmailVerification();

  return (
    <>
      {isSuccess && <Success>Your e-mail was successfully verified</Success>}
      {isError && <Error>Your email address could not be verified</Error>}
    </>
  );
};
