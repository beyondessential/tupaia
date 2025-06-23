import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { useLogin } from '../api/mutations';
import { AuthModalBody, AuthModalButton, TextField, RouterLink, Form, Modal } from '../components';
import { FORM_FIELD_VALIDATION, MODAL_ROUTES } from '../constants';
import { EmailVerificationModal } from './EmailVerificationModal';
import { useModal } from '../utils';

const ModalBody = styled(AuthModalBody)`
  width: 38rem;
`;

const StyledForm = styled(Form)`
  margin-top: 1rem;
  width: 22rem;
  max-width: 100%;
`;

const LinkText = styled(Typography)`
  font-weight: 400;
  font-size: 0.6875rem;
  line-height: 1.4;
  color: white;

  a {
    color: white;
  }

  ${AuthModalButton} + & {
    margin-top: 1.3rem;
  }
`;

const ForgotPasswordText = styled(LinkText)`
  margin-top: -0.4rem;
  float: right;
`;

export const LoginModal = () => {
  const { closeModal } = useModal();
  const formContext = useForm();
  const { mutate: login, isLoading, isError, error } = useLogin();

  return (
    <Modal isOpen onClose={closeModal}>
      <ModalBody title="Log in" subtitle="Enter your details below to log in">
        {isError ? (
          <Typography color="error">{error.message}</Typography>
        ) : (
          <EmailVerificationModal />
        )}
        <StyledForm onSubmit={login as SubmitHandler<any>} formContext={formContext}>
          <TextField
            name="email"
            label="Email"
            type="email"
            options={FORM_FIELD_VALIDATION.EMAIL}
            required
          />
          <TextField name="password" label="Password" type="password" required />
          <ForgotPasswordText as={RouterLink} modal={MODAL_ROUTES.FORGOT_PASSWORD}>
            Forgot password?
          </ForgotPasswordText>
          <AuthModalButton type="submit" isLoading={isLoading}>
            Log in
          </AuthModalButton>
          <LinkText align="center">
            Don&rsquo;t have an account?{' '}
            <RouterLink modal={MODAL_ROUTES.REGISTER}>Register here</RouterLink>
          </LinkText>
        </StyledForm>
      </ModalBody>
    </Modal>
  );
};
