/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiAlert from '@material-ui/lab/Alert';
import styled from 'styled-components';
import { Warning } from '@material-ui/icons';

const StyledAlert = styled(MuiAlert)`
  border-radius: 0;
  padding: 6px 30px;
`;

const BaseAlert = ({ children, ...props }) => (
  <StyledAlert variant="filled" {...props} children={children} />
);

export const ErrorAlert = ({ children, ...props }) => (
  <BaseAlert
    icon={<Warning fontSize="inherit" />}
    severity="error"
    {...props}
    children={children}
  />
);

export const WarningAlert = ({ children, ...props }) => (
  <BaseAlert severity="warning" {...props} children={children} />
);

export const InfoAlert = ({ children, ...props }) => (
  <BaseAlert severity="info" {...props} children={children} />
);

export const SuccessAlert = ({ children, ...props }) => (
  <BaseAlert severity="success" {...props} children={children} />
);