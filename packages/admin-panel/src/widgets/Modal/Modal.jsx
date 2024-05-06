/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { DialogFooter as BaseDialogFooter } from '@tupaia/ui-components';
import { Button, Dialog } from '@material-ui/core';
import { ModalContentProvider } from './ModalContentProvider';
import { ModalHeader } from './ModalHeader';

const DialogFooter = styled(BaseDialogFooter)`
  background-color: ${props => props.theme.palette.background.paper};
`;

export const Modal = ({
  children,
  isOpen,
  onClose,
  title,
  isLoading,
  errorMessage,
  buttons,
  ...muiDialogProps
}) => {
  return (
    <Dialog onClose={onClose} open={isOpen} disableBackdropClick {...muiDialogProps}>
      <ModalHeader onClose={onClose} title={title} />
      <ModalContentProvider errorMessage={errorMessage} isLoading={isLoading}>
        {children}
      </ModalContentProvider>
      <DialogFooter>
        {buttons?.map(({ onClick, color, text, id, disabled, variant }) => (
          <Button onClick={onClick} color={color} id={id} disabled={disabled} variant={variant}>
            {text}
          </Button>
        ))}
      </DialogFooter>
    </Dialog>
  );
};

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      onClick: PropTypes.func.isRequired,
      color: PropTypes.string,
      text: PropTypes.string.isRequired,
      id: PropTypes.string,
      disabled: PropTypes.bool,
      variant: PropTypes.string,
    }),
  ),
};

Modal.defaultProps = {
  buttons: [],
  errorMessage: '',
  isLoading: false,
};
