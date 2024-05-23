/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Outlet, Navigate } from 'react-router';
import { useUser } from '../api/queries';
import { SimplePageLayout } from './SimplePageLayout';

export const CenteredPageContent = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  .MuiPaper-root {
    border: 1px solid ${({ theme }) => theme.palette.grey['400']};
    box-shadow: none;
    height: auto;
    .MuiTypography-colorError {
      padding-block-start: 1rem;
    }
    .MuiPaper-root {
      border: none;
    }
  }
`;

export const AuthLayout = ({ logo, homeLink }) => {
  const { isLoggedIn } = useUser();
  if (isLoggedIn) {
    return <Navigate to={homeLink} />;
  }
  return (
    <SimplePageLayout logo={logo}>
      <CenteredPageContent>
        <Outlet />
      </CenteredPageContent>
    </SimplePageLayout>
  );
};

AuthLayout.propTypes = {
  logo: {
    url: PropTypes.string,
    alt: PropTypes.string,
  },
  homeLink: PropTypes.string,
};

AuthLayout.defaultProps = {
  logo: undefined,
  homeLink: '/',
};
