import React from 'react';
import styled from 'styled-components';
import { LinkProps } from 'react-router-dom-v6';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FORM_FIELD_VALIDATION } from '../../../constants';
import { Form, FormInput } from '../../Form';
import { AuthSubmitButton } from '../AuthSubmitButton';
import { RouterLink } from '../../RouterLink';
import { AuthFormTextField } from '../AuthFormTextField';
import { AuthViewWrapper } from '../AuthViewWrapper';

const StyledForm = styled(Form)`
  margin-top: 1rem;
  width: 22rem;
  max-width: 100%;
`;

interface PasswordFormProps {
  isLoading: boolean;
  formContext: ReturnType<typeof useForm>;
  onSubmit: SubmitHandler<any>;
  passwordResetToken?: string | null;
  loginLink: LinkProps['to'];
}

export const PasswordForm = ({
  passwordResetToken,
  onSubmit,
  isLoading,
  formContext,
  loginLink,
}: PasswordFormProps) => {
  const baseFormInputs = [
    {
      name: 'newPassword',
      label: 'New password',
      options: FORM_FIELD_VALIDATION.PASSWORD,
    },
    {
      name: 'newPasswordConfirm',
      label: 'Confirm password',
      options: {
        validate: (value: string) =>
          value === formContext.getValues('newPassword') || 'Passwords do not match.',
      },
    },
  ];

  // Only display the 'current password' input if there is no reset token in the url, because that means the user is already logged in
  const formInputs = passwordResetToken
    ? baseFormInputs
    : [
        {
          name: 'oldPassword',
          label: 'Current password',
          options: FORM_FIELD_VALIDATION.PASSWORD,
        },
        ...baseFormInputs,
      ];
  return (
    <AuthViewWrapper title="Reset Password" subtitle="Enter your new password below">
      <StyledForm onSubmit={onSubmit} formContext={formContext}>
        {/** Only display the 'current password' input if there is no reset token in the url */}
        {formInputs.map(({ name, label, options }) => (
          <FormInput
            key={name}
            id={name}
            name={name}
            label={label}
            type="password"
            required
            options={options}
            disabled={isLoading}
            Input={AuthFormTextField}
          />
        ))}
        <AuthSubmitButton type="submit" isLoading={isLoading}>
          Change password
        </AuthSubmitButton>
        <AuthSubmitButton variant="outlined" component={RouterLink} to={loginLink}>
          Back to login
        </AuthSubmitButton>
      </StyledForm>
    </AuthViewWrapper>
  );
};
