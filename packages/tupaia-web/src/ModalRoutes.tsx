import React from 'react';
import { MODAL_ROUTES } from './constants';
import {
  ProjectsModal,
  LoginModal,
  RegisterModal,
  VerifyEmailResendModal,
  RequestProjectAccessModal,
  ForgotPasswordModal,
  ResetPasswordModal,
  ProjectSelectModal,
} from './views';
import { useModal, useGAEffect } from './utils';

const modalViews = {
  [MODAL_ROUTES.PROJECTS]: ProjectsModal,
  [MODAL_ROUTES.PROJECT_SELECT]: ProjectSelectModal,
  [MODAL_ROUTES.LOGIN]: LoginModal,
  [MODAL_ROUTES.REGISTER]: RegisterModal,
  [MODAL_ROUTES.REQUEST_PROJECT_ACCESS]: RequestProjectAccessModal,
  [MODAL_ROUTES.FORGOT_PASSWORD]: ForgotPasswordModal,
  [MODAL_ROUTES.RESET_PASSWORD]: ResetPasswordModal,
  [MODAL_ROUTES.VERIFY_EMAIL_RESEND]: VerifyEmailResendModal,
} as const;

/**
 * This is the wrapper to handle any search param routes that should be modals
 */

export const ModalRoutes = () => {
  const { hash } = useModal();

  const modal = hash as (typeof MODAL_ROUTES)[keyof typeof MODAL_ROUTES];
  useGAEffect('User', 'Open Dialog', modal);

  // If no modal param or invalid modal param, return null
  if (!modal || !Object.values(MODAL_ROUTES).includes(modal)) return null;
  const ModalView = modalViews[modal];

  return <ModalView />;
};
