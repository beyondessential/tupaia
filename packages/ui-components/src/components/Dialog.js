/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import MuiDialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import MuiDialogContentText from '@material-ui/core/DialogContentText';
import Close from '@material-ui/icons/Close';
import styled from 'styled-components';
import { LightIconButton } from './IconButton';

const backdropColor = 'rgba(31, 88, 128, 0.72)';

export const Dialog = styled(({ children, ...props }) => (
  <MuiDialog fullWidth maxWidth="sm" {...props}>
    {children}
  </MuiDialog>
))`
  .MuiPaper-root {
    border-radius: 0;
  }

  .MuiBackdrop-root {
    background: ${backdropColor};
  }
`;

const StyledDialogTitle = styled(MuiDialogTitle)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${props => props.theme.palette.secondary.main};
  color: white;
  padding: 0.75rem 1.5rem 0.75rem 2rem;
  font-weight: bold;
  font-size: 1.3125rem;
  line-height: 3.125rem;
`;

export const DialogTitle = ({ children, ...props }) => (
  <StyledDialogTitle {...props} disableTypography>
    {children}
    {props.onClose && (
      <LightIconButton onClick={props.onClose}>
        <Close />
      </LightIconButton>
    )}
  </StyledDialogTitle>
);

DialogTitle.propTypes = {
  children: PropTypes.node.isRequired,
  onClose: PropTypes.func,
};

DialogTitle.defaultProps = {
  onClose: null,
};

export const DialogContent = styled(({ greyBackground, ...props }) => (
  <MuiDialogContent {...props} />
))`
  padding: 1.5rem 1.5rem 1.5rem 2rem;
  background-color: ${props =>
    props.greyBackground ? props.theme.palette.grey['400'] : props.theme.palette.common.white};
`;

DialogContent.propTypes = {
  greyBackground: PropTypes.bool,
};

export const DialogActions = styled(MuiDialogActions)`
  padding: 1.5rem 1.5rem 1.5rem 2rem;
  background-color: ${props => props.theme.palette.grey['400']};
  border-top: 1px solid ${props => props.theme.palette.grey['300']};

  > :not(:first-child) {
    margin-left: 1rem;
  }
`;

export const DialogContentText = styled(MuiDialogContentText)`
  color: ${props => props.theme.palette.text.primary};
`;
