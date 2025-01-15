import React, { lazy } from 'react';
import { TextField, Button, Checkbox, PasswordStrengthBar } from '@tupaia/ui-components';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import MuiFormGroup from '@material-ui/core/FormGroup';
import Typography from '@material-ui/core/Typography';
import { useForm } from 'react-hook-form';
import * as COLORS from '../../constants';
import { useRegisterUser } from '../../api';
import { I18n, useI18n } from '../../utils/I18n';

// Lazy load the password strength library as it uses zxcvbn which is a large dependency.
// For more about lazy loading components @see: https://reactjs.org/docs/code-splitting.html#reactlazy
const StrengthBarComponent = lazy(() => import('react-password-strength-bar'));

const ErrorMessage = styled.p`
  color: ${COLORS.RED};
`;

const Heading = styled(Typography)`
  font-size: 1.125rem;
  line-height: 1.3rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.primary};
  text-align: center;
  margin-bottom: 2rem;
`;

const FieldSet = styled(MuiFormGroup)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 1.25rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  padding-bottom: 1rem;
  margin-bottom: 2rem;
  ${props => props.theme.breakpoints.down('sm')} {
    display: block;
  }
`;

const StyledButton = styled(Button)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const Text = styled(Typography)`
  text-align: center;
  font-size: 1.2rem;
  line-height: 1.8rem;
`;

const SuccessMessage = () => (
  <MuiBox>
    <Heading variant="h4">
      <I18n t="register.forAnAccount" />
    </Heading>
    <MuiBox mt={4}>
      <Text>
        Congratulations, you have successfully signed up to LESMIS. To activate your account please{' '}
        <b>click the verification link in your email.</b> Once activated, you can use your new
        account to log in to lesmis.la.
      </Text>
    </MuiBox>
  </MuiBox>
);

export const RegisterForm = () => {
  const { translate } = useI18n();
  const { handleSubmit, register, errors, watch, getValues } = useForm();
  const { mutate, isError, isLoading, isSuccess, error } = useRegisterUser();
  const password = watch('password');

  if (isSuccess) {
    return <SuccessMessage />;
  }

  return (
    <form onSubmit={handleSubmit(fields => mutate(fields))} noValidate>
      <Heading variant="h4">
        <I18n t="register.forAnAccount" />
      </Heading>
      {isError && <ErrorMessage>{error.message}</ErrorMessage>}
      <FieldSet>
        <TextField
          label={translate('register.firstName')}
          name="firstName"
          type="text"
          error={!!errors.firstName}
          helperText={errors?.firstName?.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          label={translate('register.lastName')}
          name="lastName"
          type="text"
          error={!!errors.lastName}
          helperText={errors?.lastName?.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          label={translate('register.emailAddress')}
          name="emailAddress"
          type="email"
          error={!!errors.emailAddress}
          helperText={errors?.emailAddress?.message}
          inputRef={register({
            required: 'Required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'invalid email address',
            },
          })}
        />
        <TextField
          label={translate('register.contactNumber')}
          name="contactNumber"
          type="text"
          error={!!errors.contactNumber}
          helperText={errors?.contactNumber?.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          label={translate('register.employer')}
          name="employer"
          type="text"
          error={!!errors.employer}
          helperText={errors?.employer?.message}
          inputRef={register({
            required: 'Required',
          })}
        />
        <TextField
          label={translate('register.position')}
          name="position"
          type="text"
          error={!!errors.position}
          helperText={errors?.position?.message}
          inputRef={register({
            required: 'Required',
          })}
        />
      </FieldSet>
      <TextField
        label={translate('register.password')}
        name="password"
        type="password"
        error={!!errors.password}
        helperText={errors?.password?.message}
        inputRef={register({
          required: 'Required',
          minLength: { value: 9, message: 'Password must be over 8 characters long.' },
        })}
      />
      <TextField
        label={translate('register.confirmPassword')}
        name="passwordConfirm"
        type="password"
        error={!!errors.passwordConfirm}
        helperText={errors?.passwordConfirm?.message}
        inputRef={register({
          required: 'Required',
          minLength: { value: 9, message: 'Password must be over 8 characters long.' },
          validate: value => value === getValues('password') || 'Passwords do not match.',
        })}
      />
      <PasswordStrengthBar
        password={password}
        StrengthBarComponent={StrengthBarComponent}
        helperText="New password must be over 8 characters long."
        pt={1}
        pb={3}
      />
      <Checkbox
        name="terms"
        color="primary"
        label={translate('register.agreeToTerms')}
        defaultValue={false}
        error={!!errors.terms}
        helperText={errors?.terms?.message}
        inputRef={register({
          required: 'Required',
          message: 'Terms and conditions are required',
        })}
      />
      <StyledButton type="submit" fullWidth isLoading={isLoading}>
        <I18n t="register.accountNow" />
      </StyledButton>
    </form>
  );
};
