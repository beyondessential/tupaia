import React, { forwardRef } from 'react';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import styled from 'styled-components';
import { CheckCircle, Warning } from '@material-ui/icons';
import { Error } from './Icons';

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
  }
`;

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'filled',
      severity = 'success',
      iconMapping = {
        success: <CheckCircle />,
        error: <Error />,
        warning: <Warning />,
      },
      ...props
    },
    ref,
  ) => (
    <StyledAlert
      variant={variant}
      severity={severity}
      iconMapping={iconMapping}
      {...props}
      ref={ref}
    />
  ),
);

const StyledSmallAlert = styled(StyledAlert)`
  font-size: 0.875rem;
  border-radius: 3px;
  padding-block: 0;
  padding-inline: 1rem;
  box-shadow: none;
  word-break: break-word;

  .MuiAlert-icon {
    padding: 0.5rem 0;
    margin-right: 0.5rem;
    font-size: 1.5em;
  }
`;

export const SmallAlert = ({
  variant = 'filled',
  severity = 'success',

  iconMapping = {
    success: <CheckCircle fontSize="inherit" />,
    error: <Error fontSize="inherit" />,
    warning: <Warning fontSize="inherit" />,
  },

  ...props
}: AlertProps) => (
  <StyledSmallAlert variant={variant} severity={severity} iconMapping={iconMapping} {...props} />
);
