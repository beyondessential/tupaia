/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { LoginForm } from '../authentication/LoginForm';
import { useUser } from '../VizBuilderApp/api';

const Container = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  .MuiPaper-root {
    border: 1px solid ${({ theme }) => theme.palette.grey['400']};
  }
`;

export const LoginPage = ({ redirectTo }) => {
  const location = useLocation();
  const { isLoggedIn, isLoading } = useUser();
  if (isLoading) return null;
  if (isLoggedIn) {
    const redirectUrl = redirectTo || location.state?.from || '/';
    return <Navigate to={redirectUrl} />;
  }

  return (
    <Container>
      <LoginForm />
    </Container>
  );
};

LoginPage.propTypes = {
  redirectTo: PropTypes.string,
};

LoginPage.defaultProps = {
  redirectTo: null,
};
