/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { FC, ReactElement } from 'react';
import styled from 'styled-components';
import MuiIconButton, { IconButtonProps } from '@material-ui/core/IconButton';

export const IconButton: FC<IconButtonProps> = (props): ReactElement => (
  <MuiIconButton color="primary" {...props} />
);

export const LightIconButton = styled(IconButton)`
  color: white;
`;
