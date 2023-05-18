/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import MuiDialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import styled from 'styled-components';
import { IconButton } from './IconButton';
import { FlexStart } from './Layout';

const DARK_THEME_BORDER = 'rgb(82, 82, 88)';
const BACKDROP_COLOUR = 'rgba(65, 77, 85, 0.3)';
const DARK_BACKGROUND = '#262834';
const LIGHT_BACKGROUND = '#f9f9f9';

const StyledDialog = styled(MuiDialog)`
  .MuiBackdrop-root {
    background: ${BACKDROP_COLOUR};
  }

  .MuiDialog-paper {
    display: block;
  }
`;

export const Dialog = ({ children, ...props }) => (
  <StyledDialog fullWidth maxWidth="sm" {...props}>
    {children}
  </StyledDialog>
);

Dialog.propTypes = {
  children: PropTypes.any.isRequired,
};

const Header = styled(FlexStart)`
  position: relative;
  background-color: ${({ theme }) => (theme.palette.type === 'light' ? 'white' : DARK_BACKGROUND)};
  padding: 1.3rem 1.875rem 1.25rem;
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.palette.type === 'light' ? theme.palette.grey['400'] : DARK_THEME_BORDER};
`;

const DialogTitle = styled(Typography)`
  font-weight: 500;
  font-size: 1.25rem;
  line-height: 1.25rem;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0;
  right: 0;
  color: ${props => props.theme.palette.text.primary};
`;

export const DialogHeader = ({ title, onClose, color, children }) => (
  <Header>
    <DialogTitle color={color} variant="h3">
      {title}
    </DialogTitle>
    {children}
    <CloseButton onClick={onClose}>
      <CloseIcon />
    </CloseButton>
  </Header>
);

DialogHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  color: PropTypes.string,
  children: PropTypes.any,
};

DialogHeader.defaultProps = {
  color: 'textPrimary',
  children: null,
};

export const DialogContent = styled.div`
  padding: 2.5rem 1.875rem;
  background-color: ${({ theme }) =>
    theme.palette.type === 'light' ? LIGHT_BACKGROUND : DARK_BACKGROUND};
  text-align: center;
`;

export const DialogFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1.1rem 1.875rem;
  background-color: ${({ theme }) =>
    theme.palette.type === 'light' ? LIGHT_BACKGROUND : DARK_BACKGROUND};
  border-bottom: 1px solid
    ${({ theme }) =>
      theme.palette.type === 'light' ? theme.palette.grey['400'] : DARK_THEME_BORDER};
`;
