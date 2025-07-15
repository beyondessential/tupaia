import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { Button } from '@tupaia/ui-components';

import { useEmailVerification } from '../../api';
import { useLogin } from '../../api/mutations';
import * as COLORS from '../../constants';
import { I18n, useI18n } from '../../utils';
import { TextField } from '../TextField';

const ErrorMessage = styled(Typography)`
  color: ${COLORS.RED};
  margin-block: -1rem 1rem;
  margin-inline: 0;
  text-align: center;
`;

const SuccessMessage = styled(Typography)`
  color: ${COLORS.GREEN};
  margin-block: -1rem 1rem;
  margin-inline: 0;
  text-align: center;
`;

const Heading = styled(Typography)`
  color: ${props => props.theme.palette.text.primary};
  font-size: 1.125rem;
  font-weight: 400;
  line-height: 1.15;
  margin-block-end: 2rem;
  text-align: center;
`;

const StyledButton = styled(Button)`
  padding-block: 1rem;
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
        helperText={errors.email?.message}
        inputRef={register({
          required: 'Required',
        })}
      />
      <TextField
        name="password"
        type="password"
        placeholder={translate('login.password')}
        error={!!errors.password}
        helperText={errors.password?.message}
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
