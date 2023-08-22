/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiIconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { OverrideableComponentProps } from '../types';

export const IconButton = (props: OverrideableComponentProps<IconButtonProps>) => (
  <MuiIconButton color="primary" {...props} />
);

export const LightIconButton = styled(IconButton)`
  color: white;
`;
