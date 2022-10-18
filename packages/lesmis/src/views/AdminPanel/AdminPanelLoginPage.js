/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { LoginPage } from '@tupaia/admin-panel';

const StyledImg = styled.img`
  height: 6rem;
  width: auto;
  margin-bottom: 2.5rem;
`;

const LoginPageLogo = () => <StyledImg src="/lesmis-logo.svg" alt="lesmis-logo" />;

export const AdminPanelLoginPage = ({ redirectTo }) => (
  <LoginPage redirectTo={redirectTo} LogoComponent={LoginPageLogo} />
);

AdminPanelLoginPage.propTypes = {
  redirectTo: PropTypes.string.isRequired,
};
