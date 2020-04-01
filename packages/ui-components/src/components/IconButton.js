/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { IconButton } from '@material-ui/core';
import { AddBoxOutlined, IndeterminateCheckBox, Autorenew } from '@material-ui/icons';

const MuiIconButton = ({ primary, ...props }) => <IconButton {...props} />;

export const PlusIconButton = ({ ...props }) => (
  <MuiIconButton color="primary" {...props}>
    <AddBoxOutlined fontSize="inherit" />
  </MuiIconButton>
);

export const MinusIconButton = ({ ...props }) => (
  <MuiIconButton color="primary" {...props}>
    <IndeterminateCheckBox fontSize="inherit" />
  </MuiIconButton>
);

export const AutoRenewIconButton = ({ ...props }) => (
  <MuiIconButton color="primary" {...props}>
    <Autorenew fontSize="inherit" />
  </MuiIconButton>
);
