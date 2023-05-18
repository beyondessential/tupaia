/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CheckCircle, Warning } from '@material-ui/icons';
import PropTypes from 'prop-types';
import Fade from '@material-ui/core/Fade';
import MuiAlert from '@material-ui/lab/Alert';

const StyledAlert = styled(MuiAlert)`
  position: relative;
  font-size: 0.875rem;
  line-height: 1rem;
  border-radius: 3px;
  padding: 0.5rem 1rem 0.6rem;
  box-shadow: none;
  align-items: center;
  justify-content: center;

  .MuiAlert-icon {
    padding: 0.5rem 0;
    margin-right: 0.5rem;
    font-size: 1.5em;
  }

  .MuiAlert-action {
    position: absolute;
    right: 0;
    padding-left: 0;
    padding-right: 1rem;
    opacity: 0.8;
  }
`;

export const Toast = ({ variant, severity, timeout, iconMapping, ...props }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (timeout) {
      setTimeout(() => {
        setOpen(false);
      }, timeout);
    }
  }, [setOpen, timeout]);

  return (
    <Fade in={open}>
      <StyledAlert
        variant={variant}
        severity={severity}
        iconMapping={iconMapping}
        onClose={() => {
          setOpen(false);
        }}
        {...props}
      />
    </Fade>
  );
};

Toast.propTypes = {
  severity: PropTypes.string,
  variant: PropTypes.string,
  timeout: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
  iconMapping: PropTypes.object,
};

Toast.defaultProps = {
  severity: 'success',
  variant: 'filled',
  timeout: false,
  iconMapping: {
    success: <CheckCircle />,
    error: <Warning />,
  },
};
