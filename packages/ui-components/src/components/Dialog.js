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
import * as COLORS from '../theme/colors';

/*
 * Dialog
 */
export const Dialog = styled(({ children, ...props }) => (
  <MuiDialog fullWidth maxWidth="sm" {...props}>
    {children}
  </MuiDialog>
))`
  .MuiPaper-root {
    border-radius: 0;
  }

  .MuiBackdrop-root {
    background: ${COLORS.BLUE_BACKDROP};
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

/*
 * DialogTitle
 */
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

/*
 * DialogContent
 */
export const DialogContent = styled(({ greyBackground, ...props }) => (
  <MuiDialogContent {...props} />
))`
  padding: 1.5rem 1.5rem 1.5rem 2rem;
  background-color: ${props => (props.greyBackground ? COLORS.GREY_FB : COLORS.WHITE)};
`;

DialogContent.propTypes = {
  greyBackground: PropTypes.bool,
};

/*
 * DialogActions
 */
export const DialogActions = styled(MuiDialogActions)`
  padding: 1.5rem 1.5rem 1.5rem 2rem;
  background-color: ${COLORS.GREY_FB};
  border-top: 1px solid ${COLORS.GREY_E2};

  > :not(:first-child) {
    margin-left: 1rem;
  }
`;

/*
 * DialogContentText
 */
export const DialogContentText = styled(MuiDialogContentText)`
  color: ${COLORS.TEXT_DARKGREY};
`;
