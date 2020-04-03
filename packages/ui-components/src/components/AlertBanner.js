/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import MuiAlert from '@material-ui/lab/Alert';
import styled from 'styled-components';

const StyledButton = styled(MuiAlert)`
  border-radius: 0;
`;

export const AlertBanner = ({ children, ...props }) => (
  <MuiAlert variant="filled" severity="error" {...props}>{ children }</MuiAlert>
);

export const ErrorAlertBanner = ({ children, ...props }) => (
  <MuiAlert variant="filled" severity="error" {...props}>{ children }</MuiAlert>
);
