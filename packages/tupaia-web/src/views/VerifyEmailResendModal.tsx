import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { SubmitHandler, useForm } from 'react-hook-form';
import { AuthModalBody, AuthModalButton, TextField, Form, Modal } from '../components';
import { FORM_FIELD_VALIDATION } from '../constants';
import { useResendVerificationEmail } from '../api/mutations';
import { useModal } from '../utils';

const ModalBody = styled(AuthModalBody)`
  width: 53rem;
`;

const CheckEmailMessage = styled.p`
  text-align: center;
  padding: 0 0.9375rem;
`;

const StyledForm = styled(Form)`
  margin-top: 1rem;
  width: 21rem;
  max-width: 100%;
`;

export const VerifyEmailResendModal = () => {
  const formContext = useForm();
  const { closeModal } = useModal();
  const { mutate: submit, isSuccess, isLoading, isError, error } = useResendVerificationEmail();

  return (
    <Modal isOpen onClose={closeModal}>
      <ModalBody
        title="Resend verification email"
        subtitle="Enter your email below to resend verification email"
      >
        {isError && <Typography color="error">{error.message}</Typography>}
        {isSuccess ? (
          <CheckEmailMessage>
            Please check your email for further instructions on how to verify your account.
          </CheckEmailMessage>
        ) : (
          <StyledForm onSubmit={submit as SubmitHandler<any>} formContext={formContext}>
            <TextField
              name="email"
              label="Email"
              type="email"
              options={FORM_FIELD_VALIDATION.EMAIL}
            />
            <AuthModalButton type="submit" isLoading={isLoading}>
              Resend verification email
            </AuthModalButton>
          </StyledForm>
        )}
      </ModalBody>
    </Modal>
  );
};
