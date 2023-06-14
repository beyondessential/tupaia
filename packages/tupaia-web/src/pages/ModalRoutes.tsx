/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { MODAL_ROUTES } from '../constants';
import {
  Projects,
  Login,
  Register,
  VerifyEmailResend,
  PasswordResetForm,
  RequestAccessForm,
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
  [MODAL_ROUTES.RESET_PASSWORD]: PasswordResetForm,
  [MODAL_ROUTES.REQUEST_ACCESS]: RequestAccessForm,
  [MODAL_ROUTES.VERIFY_EMAIL_RESEND]: VerifyEmailResend,
};

export const ModalRoutes = () => {
  const { hash, closeModal } = useModal();

  const modal = hash as typeof MODAL_ROUTES[keyof typeof MODAL_ROUTES];

  // If no modal param or invalid modal param, return null
  if (!modal || !Object.values(MODAL_ROUTES).includes(modal)) return null;

  const ModalView = modalViews[modal];
  return (
    <Modal isOpen={true} onClose={closeModal}>
      <ModalView />
    </Modal>
  );
};
