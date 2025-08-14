import React from 'react';
import { useAdminPanelUrl } from '../../utils';
import { LoginPage } from './pages/LoginPage';

export const AdminPanelLoginPage = () => {
  const adminUrl = useAdminPanelUrl();
  return <LoginPage homeLink={`${adminUrl}/survey-responses`} />;
};
