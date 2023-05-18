/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiIconButton from '@material-ui/core/IconButton';

export const IconButton = props => <MuiIconButton color="primary" fontSize="inherit" {...props} />;

export const LightIconButton = styled(IconButton)`
  color: white;
`;
