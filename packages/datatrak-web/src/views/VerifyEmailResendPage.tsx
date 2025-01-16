import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ResendVerificationEmailForm } from '@tupaia/ui-components';
import { useResendVerificationEmail } from '../api/mutations';

export const VerifyEmailResendPage = () => {
  const formContext = useForm();
  const { mutate: resend, isLoading, error, isSuccess } = useResendVerificationEmail();
  return (
    <ResendVerificationEmailForm
      onSubmit={resend as SubmitHandler<any>}
      isLoading={isLoading}
      error={error}
      isSuccess={isSuccess}
      formContext={formContext}
    />
  );
};
