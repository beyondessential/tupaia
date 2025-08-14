import React from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import {
  AuthModalBody,
  AuthModalButton,
  Form,
  Modal,
  RouterButton,
  RouterLink,
  TextField,
} from '../components';
import { useRequestResetPassword } from '../api/mutations';
import { FORM_FIELD_VALIDATION, MODAL_ROUTES } from '../constants';
import { useModal } from '../utils';

const ModalBody = styled(AuthModalBody)`
  width: 38rem;
`;
const StyledForm = styled(Form)`
  margin-top: 1rem;
  width: 22rem;
  max-width: 100%;
`;

export const CancelButton = styled(RouterButton).attrs({
  color: 'default',
  variant: 'outlined',
})`
  text-transform: none;
  font-size: 1rem;
  width: 22rem;
  max-width: 100%;
  margin-left: 0 !important;
  padding: 0.375rem 1rem; // to match the height of the primary button
  border-color: ${({ theme }) => theme.palette.text.secondary};
  margin-top: 1.3rem;
`;

const CheckEmailMessage = styled.p`
  text-align: center;
  padding: 0 0.9375rem;
`;

const LinkText = styled(Typography)`
  font-size: 0.6875rem;
  line-height: 1.4;
  color: white;

  a {
    color: white;
  }

  ${CancelButton} + & {
    margin-top: 1.3rem;
  }
`;

export const ForgotPasswordModal = () => {
  const formContext = useForm();
  const { closeModal } = useModal();
  const {
    mutate: requestResetPassword,
    isLoading,
    isError,
    error,
    isSuccess,
  } = useRequestResetPassword();
  const HEADING_TEXT = {
    title: 'Forgot password',
    subtitle: 'Enter your email below to reset your password',
  };
  if (isSuccess) {
    HEADING_TEXT.title = 'Forgot password email sent';
    HEADING_TEXT.subtitle = '';
  }
  return (
    <Modal isOpen onClose={closeModal}>
      <ModalBody title={HEADING_TEXT.title} subtitle={HEADING_TEXT.subtitle}>
        {isError && <Typography color="error">{error.message}</Typography>}
        {isSuccess ? (
          <CheckEmailMessage>
            Please check your email for further information on how to reset your password
          </CheckEmailMessage>
        ) : (
          <StyledForm
            onSubmit={requestResetPassword as SubmitHandler<any>}
            formContext={formContext}
          >
            <TextField
              autoComplete="email"
              name="emailAddress"
              label="Email"
              type="email"
              required
              options={FORM_FIELD_VALIDATION.EMAIL}
              disabled={isLoading}
            />
            <AuthModalButton type="submit" isLoading={isLoading}>
              Reset password
            </AuthModalButton>
            <CancelButton modal={MODAL_ROUTES.LOGIN}>Back to login</CancelButton>
            <LinkText align="center">
              Don&rsquo;t have an account?{' '}
              <RouterLink modal={MODAL_ROUTES.REGISTER}>Register here</RouterLink>
            </LinkText>
          </StyledForm>
        )}
      </ModalBody>
    </Modal>
  );
};
