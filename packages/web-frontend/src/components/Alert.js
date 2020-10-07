/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiAlert from '@material-ui/lab/Alert';
import styled from 'styled-components';
import { CheckCircle, Warning } from '@material-ui/icons';
import PropTypes from 'prop-types';

const StyledSmallAlert = styled(MuiAlert)`
  &.MuiAlert-root {
    display: flex;
    align-items: flex-start;
    font-weight: 400;
    font-size: 0.875rem;
    border-radius: 3px;
    padding: 0.8rem 1.25rem;
    box-shadow: none;
  }

  &.MuiAlert-standardError {
    background: #fee2e2;
    border: 1px solid rgba(209, 51, 51, 0.15);
    color: #d13333;

    .MuiAlert-icon {
      color: #d13333;
    }
  }

  &.MuiAlert-standardInfo {
    color: #8b6e37;
    background: #fcf8e2;
    border: 1px solid #faecca;

    .MuiAlert-icon {
      color: #8b6e37;
    }
  }

  .MuiAlert-icon {
    margin-right: 0.3rem;
    font-size: 1.5em;
  }
`;

export const AlertAction = styled.button`
  font-family: Roboto, sans-serif;
  background: none;
  color: inherit;
  font-weight: 500;
  box-shadow: none;
  border: none;
  font-size: 0.875rem;
  text-decoration: underline;

  &:hover {
    cursor: pointer;
  }

  &:focus {
    outline: none;
  }
`;

export const AlertLink = styled.a`
  font-size: 0.875rem;
  text-decoration: underline;
  color: inherit;
  font-weight: 500;
`;

export const Alert = ({ variant, severity, iconMapping, ...props }) => (
  <StyledSmallAlert variant={variant} severity={severity} iconMapping={iconMapping} {...props} />
);

Alert.propTypes = {
  severity: PropTypes.string,
  variant: PropTypes.string,
  iconMapping: PropTypes.object,
};

Alert.defaultProps = {
  severity: 'success',
  variant: 'standard',
  iconMapping: {
    success: <CheckCircle fontSize="inherit" />,
    error: <Warning fontSize="inherit" />,
    warning: <Warning fontSize="inherit" />,
  },
};
