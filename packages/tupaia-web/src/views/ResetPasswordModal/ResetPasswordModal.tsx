/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { useOneTimeLogin } from '../../api/mutations';
import { useModal } from '../../utils';
import { URL_SEARCH_PARAMS } from '../../constants';
import { AuthModalBody, LoadingScreen, Modal } from '../../components';
import { OneTimeLogin } from './OneTimeLogin';
import { ResetPasswordForm } from './ResetPasswordForm';

const ModalBody = styled(AuthModalBody)`
  width: 38rem;
`;

export const ResetPasswordModal = () => {
  const [urlSearchParams] = useSearchParams();
  const { closeModal } = useModal();
  const { mutate: attemptLogin, isError, isLoading, isSuccess } = useOneTimeLogin();
  const token = urlSearchParams.get(URL_SEARCH_PARAMS.PASSWORD_RESET_TOKEN);

  const handleLogin = () => {
    attemptLogin({ token } as {
      token: string;
    });
  };

  const onCloseModal = () => {
    closeModal([URL_SEARCH_PARAMS.PASSWORD_RESET_TOKEN]);
  };

  return (
    <Modal isOpen onClose={onCloseModal}>
      <ModalBody title="Change password">
        <LoadingScreen isLoading={isLoading} />
        {token && !isSuccess ? (
          <OneTimeLogin attemptLogin={handleLogin} isError={isError} />
        ) : (
          <ResetPasswordForm />
        )}
      </ModalBody>
    </Modal>
  );
};
