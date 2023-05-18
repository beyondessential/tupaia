/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiIconButton, { IconButtonProps } from '@material-ui/core/IconButton';

export const IconButton = (props: IconButtonProps) => <MuiIconButton color="primary" {...props} />;

export const LightIconButton = styled(IconButton)`
  color: white;
`;
