import React from 'react';
import { LoginPage as AdminLoginPage } from '@tupaia/admin-panel';
import { useAdminPanelUrl, useI18n } from '../../../utils';

export const LoginPage = () => {
  const adminUrl = useAdminPanelUrl();
  const { translate } = useI18n();

  return (
    <AdminLoginPage
      labels={{
        email: translate('login.email'),
        password: translate('login.password'),
        forgotPassword: translate('login.forgotPassword'),
        login: translate('login.loginToYourAccount'),
        dontHaveAnAccount: translate('login.dontHaveAccess'),
        register: translate('login.requestAnAccount'),
      }}
      homeLink={`${adminUrl}/survey-responses`}
    />
  );
};
