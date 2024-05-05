/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { useLocation } from 'react-router';
import styled from 'styled-components';
import { useAdminPanelUrl } from '../../utils';
import { LoginPage } from './pages/LoginPage';

const StyledImg = styled.img`
  height: 6rem;
  width: auto;
  margin-bottom: 2.5rem;
`;

const LoginPageLogo = () => <StyledImg src="/lesmis-logo.svg" alt="lesmis-logo" />;

export const AdminPanelLoginPage = () => {
  const adminUrl = useAdminPanelUrl();
  const location = useLocation();
  const redirectTo = location.state?.referrer || `${adminUrl}/survey-responses`;
  return <LoginPage redirectTo={redirectTo} LogoComponent={LoginPageLogo} />;
};
