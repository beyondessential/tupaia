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

function isModalRoute(hash: string): hash is MODAL_ROUTES {
  return modalViews.hasOwnProperty(hash);
}

/**
 * This is the wrapper to handle any search param routes that should be modals
 */
export const ModalRoutes = () => {
  const { hash } = useModal();
  if (!isModalRoute(hash)) return null;

  useGAEffect('User', 'Open Dialog', hash);

  const ModalView = modalViews[hash];
  return <ModalView />;
};
