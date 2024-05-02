/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { OutlinedButton } from '@tupaia/ui-components';
import styled from 'styled-components';
import AddCircleIcon from '@material-ui/icons/AddCircle';

export const ActionButton = styled(OutlinedButton).attrs({
  color: 'primary',
})``;

export const CreateActionButton = styled(ActionButton).attrs({
  id: 'page-new-button',
  startIcon: <AddCircleIcon />,
})``;
