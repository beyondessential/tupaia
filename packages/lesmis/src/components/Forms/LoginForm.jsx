import React from 'react';
import { TextField, Button } from '@tupaia/ui-components';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { useForm } from 'react-hook-form';
import * as COLORS from '../../constants';
import { useLogin } from '../../api/mutations';
import { I18n, useI18n } from '../../utils';
import { useEmailVerification } from '../../api';

const ErrorMessage = styled(Typography)`
  text-align: center;
  color: ${COLORS.RED};
  margin: -1rem 0 1rem;
`;

const SuccessMessage = styled(Typography)`
  text-align: center;
  color: ${COLORS.GREEN};
  margin: -1rem 0 1rem;
`;

const Heading = styled(Typography)`
  font-size: 1.125rem;
  line-height: 1.3rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.primary};
  text-align: center;
  margin-bottom: 2rem;
`;

const StyledButton = styled(Button)`
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

const VerifyEmail = () => {
  const { isSuccess, isError } = useEmailVerification();

  return (
    <>
      {isSuccess && <SuccessMessage>Your e-mail was successfully verified</SuccessMessage>}
      {isError && <ErrorMessage>Your email address could not be verified</ErrorMessage>}
    </>
  );
};

export const LoginForm = () => {
  const { translate } = useI18n();
  const { handleSubmit, register, errors } = useForm();
  const { mutate: login, user, isError, isLoading, isSuccess, error } = useLogin();

  return (
    <form onSubmit={handleSubmit(({ email, password }) => login({ email, password }))} noValidate>
      <Heading variant="h4">
        <I18n t="login.enterYourEmailAndPassword" />
      </Heading>
      {isError ? <ErrorMessage>{error.message}</ErrorMessage> : <VerifyEmail />}
      <TextField
        name="email"
        placeholder={translate('login.email')}
        type="email"
        defaultValue={user?.email}
        error={!!errors.email}
        helperText={errors.email && errors.email.message}
        inputRef={register({
          required: 'Required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'invalid email address',
          },
        })}
      />
      <TextField
        name="password"
        type="password"
        placeholder={translate('login.password')}
        error={!!errors.password}
        helperText={errors.password && errors.password.message}
        inputRef={register({
          required: 'Required',
        })}
      />
      {/* Todo: Remember me feature. @see https://github.com/beyondessential/tupaia-backlog/issues/2261 */}
      {/* <Checkbox */}
      {/*  name="rememberMe" */}
      {/*  color="primary" */}
      {/*  label="Remember me" */}
      {/*  inputRef={register} */}
      {/*  defaultValue={false} */}
      {/* /> */}
      <StyledButton type="submit" fullWidth isLoading={isLoading || isSuccess}>
        <I18n t="login.loginToYourAccount" />
      </StyledButton>
    </form>
  );
};
