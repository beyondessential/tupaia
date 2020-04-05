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

export const ErrorAlert = ({ children, ...props }) => (
  <StyledAlert variant="filled" icon={<Warning fontSize="inherit" />} severity="error" {...props}>
    {children}
  </StyledAlert>
);

export const WarningAlert = ({ children, ...props }) => (
  <StyledAlert variant="filled" severity="warning" {...props}>
    {children}
  </StyledAlert>
);

export const InfoAlert = ({ children, ...props }) => (
  <StyledAlert variant="filled" severity="info" {...props}>
    {children}
  </StyledAlert>
);

export const SuccessAlert = ({ children, ...props }) => (
  <StyledAlert variant="filled" severity="success" {...props}>
    {children}
  </StyledAlert>
);