/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';

const Success = styled(Typography)`
  color: ${({ theme }) => theme.palette.success.main};
`;

const Error = styled(Typography)`
  color: ${({ theme }) => theme.palette.error.main};
`;

export enum STATUS {
  IDLE = 'idle',
  SUCCESS = 'success',
  ERROR = 'error',
}

export const EmailVerificationDisplay = ({ status }: { status?: STATUS }) => {
  if (status === STATUS.SUCCESS) return <Success>Your e-mail was successfully verified</Success>;
  if (status === STATUS.ERROR) return <Error>Your email address could not be verified</Error>;
  return null;
};
