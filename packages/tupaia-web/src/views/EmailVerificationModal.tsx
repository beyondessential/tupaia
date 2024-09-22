/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { get } from '../api';

const Success = styled(Typography)`
  color: ${({ theme }) => theme.palette.success.main};
`;

const Error = styled(Typography)`
  color: ${({ theme }) => theme.palette.error.main};
`;

const VERIFY_EMAIL_URL_PARAM = 'verifyEmailToken';

const STATUS = {
  IDLE: 'idle',
  SUCCESS: 'success',
  ERROR: 'error',
};

export const EmailVerificationModal = () => {
  // We need to save the status in state so that we can display the message to the user even after the
  // url param is cleared
  const [status, setStatus] = useState(STATUS.IDLE);
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifyEmailToken = urlSearchParams.get(VERIFY_EMAIL_URL_PARAM);

  useQuery(
    ['verifyEmail', verifyEmailToken],
    () => get(`verifyEmail?emailToken=${verifyEmailToken}`),
    {
      enabled: !!verifyEmailToken,
      onError: () => {
        setStatus(STATUS.ERROR);
      },
      onSuccess: () => {
        setStatus(STATUS.SUCCESS);
      },
      onSettled: () => {
        // Clear the url param
        urlSearchParams.delete(VERIFY_EMAIL_URL_PARAM);
        navigate({
          ...location,
          search: urlSearchParams.toString(),
        });
      },
    },
  );

  if (status === STATUS.SUCCESS) return <Success>Your e-mail was successfully verified</Success>;
  if (status === STATUS.ERROR) return <Error>Your email address could not be verified</Error>;
  return null;
};
