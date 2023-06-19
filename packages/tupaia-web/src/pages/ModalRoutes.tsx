/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { MODAL_ROUTES, PASSWORD_RESET_TOKEN_PARAM, PROJECT_PARAM } from '../constants';
import {
  Projects,
  Login,
  Register,
  VerifyEmailResend,
  RequestProjectAccess,
  RequestCountryAccess,
  ForgotPassword,
  ResetPassword,
} from '.';
import { Modal } from '../components';
import { useModal } from '../utils';

/**
 * This is the wrapper to handle any search param routes that should be modals
 */

const modalViews = {
  [MODAL_ROUTES.PROJECTS]: Projects,
  [MODAL_ROUTES.LOGIN]: Login,
  [MODAL_ROUTES.REGISTER]: Register,
  [MODAL_ROUTES.REQUEST_COUNTRY_ACCESS]: RequestCountryAccess,
  [MODAL_ROUTES.REQUEST_PROJECT_ACCESS]: RequestProjectAccess,
  [MODAL_ROUTES.FORGOT_PASSWORD]: ForgotPassword,
  [MODAL_ROUTES.RESET_PASSWORD]: ResetPassword,
  [MODAL_ROUTES.VERIFY_EMAIL_RESEND]: VerifyEmailResend,
};

const modalParams = {
  [MODAL_ROUTES.REQUEST_PROJECT_ACCESS]: [PROJECT_PARAM],
  [MODAL_ROUTES.RESET_PASSWORD]: [PASSWORD_RESET_TOKEN_PARAM],
};

export const ModalRoutes = () => {
  const { hash, closeModal } = useModal();

  const modal = hash as typeof MODAL_ROUTES[keyof typeof MODAL_ROUTES];

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
