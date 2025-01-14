import React from 'react';
import { OutlinedButton } from '@tupaia/ui-components';
import styled from 'styled-components';
import { Add } from '@material-ui/icons';

export const ActionButton = styled(OutlinedButton).attrs({
  color: 'primary',
})`
  line-height: 1.5;
  padding-block: 0.5rem;
  padding-inline: 1.3rem;
  display: flex;
  .MuiButton-startIcon {
    margin-inline-end: 0.3rem;
  }
`;

export const CreateActionButton = styled(ActionButton).attrs({
  id: 'page-new-button',
  startIcon: <Add />,
})``;
