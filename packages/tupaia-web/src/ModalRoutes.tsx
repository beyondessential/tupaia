/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect } from 'react';
import { MODAL_ROUTES, URL_SEARCH_PARAMS } from './constants';
import {
  ProjectsModal,
  LoginModal,
  RegisterModal,
  VerifyEmailResendModal,
  RequestProjectAccessModal,
  RequestCountryAccessModal,
  ForgotPasswordModal,
  ResetPasswordModal,
} from './views';
import { Modal } from './components';
import { useModal, gaEvent } from './utils';

/**
 * This is the wrapper to handle any search param routes that should be modals
 */

const modalViews = {
  [MODAL_ROUTES.PROJECTS]: ProjectsModal,
  [MODAL_ROUTES.LOGIN]: LoginModal,
  [MODAL_ROUTES.REGISTER]: RegisterModal,
  [MODAL_ROUTES.REQUEST_COUNTRY_ACCESS]: RequestCountryAccessModal,
  [MODAL_ROUTES.REQUEST_PROJECT_ACCESS]: RequestProjectAccessModal,
  [MODAL_ROUTES.FORGOT_PASSWORD]: ForgotPasswordModal,
  [MODAL_ROUTES.RESET_PASSWORD]: ResetPasswordModal,
  [MODAL_ROUTES.VERIFY_EMAIL_RESEND]: VerifyEmailResendModal,
};

const modalParams = {
  [MODAL_ROUTES.REQUEST_PROJECT_ACCESS]: [URL_SEARCH_PARAMS.PROJECT],
  [MODAL_ROUTES.RESET_PASSWORD]: [URL_SEARCH_PARAMS.PASSWORD_RESET_TOKEN],
};

export const ModalRoutes = () => {
  const { hash, closeModal } = useModal();

  const modal = hash as typeof MODAL_ROUTES[keyof typeof MODAL_ROUTES];
  useEffect(() => {
    if (modal === null) {
      gaEvent('User', 'Close Modal');
    }
    gaEvent('User', modal, 'Open Modal');
  }, [modal]);

  // If no modal param or invalid modal param, return null
  if (!modal || !Object.values(MODAL_ROUTES).includes(modal)) return null;
  const ModalView = modalViews[modal];

  const onCloseModal = () => {
    closeModal(modalParams[modal as keyof typeof modalParams]);
  };
  return (
    <Modal isOpen={true} onClose={onCloseModal}>
      <ModalView />
    </Modal>
  );
};
