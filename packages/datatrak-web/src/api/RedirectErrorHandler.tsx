import React, { ReactNode, useEffect } from 'react';
import { REDIRECT_ERROR_PARAM } from '../constants';
import { useSearchParams } from 'react-router-dom';
import { errorToast } from '../utils';

/**
 * Wrapper component to ensure the the `redirectError` url  parameter gets pushed to the toast notifications
 */
export const RedirectErrorHandler = ({ children }: { children?: ReactNode }) => {
  const [searchParams] = useSearchParams();
  const redirectError = searchParams.get(REDIRECT_ERROR_PARAM);

  useEffect(() => {
    if (redirectError) {
      errorToast(redirectError);
    }
  }, [redirectError]);

  return <>{children}</>;
};
