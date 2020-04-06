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

const BaseAlert = props => <StyledAlert variant="filled" {...props} />;

export const ErrorAlert = props => (
  <BaseAlert icon={<Warning fontSize="inherit" />} severity="error" {...props} />
);

export const WarningAlert = props => <BaseAlert severity="warning" {...props} />;

export const InfoAlert = props => <BaseAlert severity="info" {...props} />;

export const SuccessAlert = props => <BaseAlert severity="success" {...props} />;
