/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { USER_ROUTES } from '../constants';
import { Projects, LoginModal, RegisterModal } from '.';
import { Modal } from '../components';

/**
 * This is the wrapper to handle any search param routes that should be modals
 */

const modalViews = {
  [USER_ROUTES.PROJECTS]: Projects,
  [USER_ROUTES.LOGIN]: LoginModal,
  [USER_ROUTES.REGISTER]: RegisterModal,
  [USER_ROUTES.RESET_PASSWORD]: Projects,
  [USER_ROUTES.REQUEST_ACCESS]: Projects,
  [USER_ROUTES.VERIFY_EMAIL_RESEND]: Projects,
};

export const ModalRoute = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const modal = searchParams.get('modal') as typeof USER_ROUTES[keyof typeof USER_ROUTES];

  // If no modal param or invalid modal param, return null
  if (!modal || !Object.values(USER_ROUTES).includes(modal)) return null;

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
