/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiAlert from '@material-ui/lab/Alert';
import styled from 'styled-components';
import { CheckCircle, Warning } from '@material-ui/icons';
import PropTypes from 'prop-types';

const StyledAlert = styled(MuiAlert)`
  border-radius: 0;
  font-weight: 400;
  align-items: center;
  padding: 0.9rem 1.25rem 0.8rem 2.5rem;
  box-shadow: inset 0px -1px 0px rgba(0, 0, 0, 0.15);
  white-space: pre-wrap;

  .MuiAlert-icon {
    margin-right: 0.8rem;
  }

  &.MuiAlert-standardError {
    background: ${props => props.theme.palette.error.light};
    color: ${props => props.theme.palette.error.main};
  }
`;

export const Alert = ({ variant, severity, iconMapping, ...props }) => (
  <StyledAlert variant={variant} severity={severity} iconMapping={iconMapping} {...props} />
);

Alert.propTypes = {
  severity: PropTypes.string,
  variant: PropTypes.string,
  iconMapping: PropTypes.object,
};

Alert.defaultProps = {
  severity: 'success',
  variant: 'filled',
  iconMapping: {
    success: <CheckCircle />,
    error: <Warning />,
    warning: <Warning />,
  },
};

const StyledSmallAlert = styled(StyledAlert)`
  font-size: 0.875rem;
  border-radius: 3px;
  padding: 0.5rem 1.25rem 0.5rem 1rem;
  box-shadow: none;

  .MuiAlert-icon {
    padding: 0.5rem 0;
    margin-right: 0.5rem;
    font-size: 1.5em;
  }
`;

export const SmallAlert = ({ variant, severity, iconMapping, ...props }) => (
  <StyledSmallAlert variant={variant} severity={severity} iconMapping={iconMapping} {...props} />
);

SmallAlert.propTypes = {
  severity: PropTypes.string,
  variant: PropTypes.string,
  iconMapping: PropTypes.object,
};

SmallAlert.defaultProps = {
  severity: 'success',
  variant: 'filled',
  iconMapping: {
    success: <CheckCircle fontSize="inherit" />,
    error: <Warning fontSize="inherit" />,
    warning: <Warning fontSize="inherit" />,
  },
};
