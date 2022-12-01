/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { LoginPage } from '@tupaia/admin-panel';
import { useAdminPanelUrl } from '../../utils';

const StyledImg = styled.img`
  height: 6rem;
  width: auto;
  margin-bottom: 2.5rem;
`;

const LoginPageLogo = () => <StyledImg src="/lesmis-logo.svg" alt="lesmis-logo" />;

export const AdminPanelLoginPage = () => {
  const adminUrl = useAdminPanelUrl();
  return <LoginPage redirectTo={`${adminUrl}/survey-responses`} LogoComponent={LoginPageLogo} />;
};
