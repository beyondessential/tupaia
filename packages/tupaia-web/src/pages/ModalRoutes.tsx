/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { MODAL_ROUTES } from '../constants';
import { Projects, LoginModal, RegisterModal, VerifyEmailResend } from '.';
import { Modal } from '../components';

/**
 * This is the wrapper to handle any search param routes that should be modals
 */

const modalViews = {
  [MODAL_ROUTES.PROJECTS]: Projects,
  [MODAL_ROUTES.LOGIN]: LoginModal,
  [MODAL_ROUTES.REGISTER]: RegisterModal,
  // [MODAL_ROUTES.RESET_PASSWORD]: Projects,
  // [MODAL_ROUTES.REQUEST_ACCESS]: Projects,
  [MODAL_ROUTES.VERIFY_EMAIL_RESEND]: VerifyEmailResend,
};

export const ModalRoutes = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const modal = searchParams.get('modal') as typeof MODAL_ROUTES[keyof typeof MODAL_ROUTES];

  // If no modal param or invalid modal param, return null
  if (!modal || !Object.values(MODAL_ROUTES).includes(modal)) return null;

  const onCloseModal = () => {
    // remove the modal param from URLSearchParams
    searchParams.delete('modal');
    setSearchParams(searchParams);
  };

  const ModalView = modalViews[modal];
  return (
    <Modal isOpen={true} onClose={onCloseModal}>
      <ModalView />
    </Modal>
  );
};
