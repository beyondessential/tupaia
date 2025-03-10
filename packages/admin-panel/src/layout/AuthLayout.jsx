import PropTypes from 'prop-types';
import React from 'react';
import { Outlet } from 'react-router';
import styled from 'styled-components';

import { SimplePageLayout } from './SimplePageLayout';

export const CenteredPageContent = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
  .MuiPaper-root {
    border: 1px solid ${({ theme }) => theme.palette.divider};
    box-shadow: none;
    height: auto;
    .MuiTypography-colorError {
      padding-block-start: 1rem;
    }
    .MuiPaper-root {
      border: none;
    }
  }
  .MuiFormLabel-asterisk,
  .MuiFormLabel-root.MuiInputLabel-root {
    color: ${({ theme }) => theme.palette.text.hint};
    font-weight: normal;
  }
  .MuiInput-underline:before {
    border-bottom: 1px solid ${({ theme }) => theme.palette.text.hint};
  }
  .MuiFormControl-root + a {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
`;

export const AuthLayout = ({ logo }) => {
  return (
    <SimplePageLayout logo={logo} displayLogoutButton={false} disableHomeLink>
      <CenteredPageContent>
        <Outlet />
      </CenteredPageContent>
    </SimplePageLayout>
  );
};

AuthLayout.propTypes = {
  logo: PropTypes.shape({
    url: PropTypes.string,
    alt: PropTypes.string,
  }),
};

AuthLayout.defaultProps = {
  logo: undefined,
};
