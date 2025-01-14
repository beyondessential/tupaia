import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CheckCircle, Warning } from '@material-ui/icons';
import Fade from '@material-ui/core/Fade';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';

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

interface ToastProps extends AlertProps {
  timeout?: number;
}

export const Toast = ({
  variant = 'filled',
  severity = 'success',
  timeout = 0,
  iconMapping = {
    success: <CheckCircle />,
    error: <Warning />,
  },
  ...props
}: ToastProps) => {
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
