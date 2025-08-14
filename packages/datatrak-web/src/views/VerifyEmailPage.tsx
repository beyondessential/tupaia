import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EMAIL_VERIFICATION_STATUS } from '@tupaia/ui-components';
import { get } from '../api';
import { LoginPage } from '.';

const VERIFY_EMAIL_URL_PARAM = 'verifyEmailToken';

/**
 * This is a wrapper around the login page to handle verification of email tokens
 */
export const VerifyEmailPage = () => {
  // We need to save the status in state so that we can display the message to the user even after the
  // url param is cleared
  const [message, setMessage] = useState<{
    status?: EMAIL_VERIFICATION_STATUS | string;
    text?: string;
  } | null>(null);
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const verifyEmailToken = urlSearchParams.get(VERIFY_EMAIL_URL_PARAM);

  useQuery(
    ['verifyEmail', verifyEmailToken],
    () =>
      get('verifyEmail', {
        params: { emailToken: verifyEmailToken },
      }),
    {
      enabled: !!verifyEmailToken,
      onError: () => {
        setMessage({
          status: EMAIL_VERIFICATION_STATUS.ERROR,
          text: 'Your email address could not be verified',
        });
      },
      onSuccess: () => {
        setMessage({
          status: EMAIL_VERIFICATION_STATUS.SUCCESS,
          text: 'Your e-mail was successfully verified',
        });
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

  return <LoginPage message={message} />;
};
