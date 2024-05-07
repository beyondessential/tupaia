/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { DialogFooter as BaseDialogFooter, Button } from '@tupaia/ui-components';
import { Dialog } from '@material-ui/core';
import { ModalContentProvider } from './ModalContentProvider';
import { ModalHeader } from './ModalHeader';

export const ModalFooter = styled(BaseDialogFooter)`
  background-color: ${props => props.theme.palette.background.paper};
  padding-block: 1.3rem;
  padding-inline: 1.9rem;
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
    <Dialog onClose={onClose} open={isOpen} fullWidth {...muiDialogProps}>
      <ModalHeader onClose={onClose} title={title} />
      <ModalContentProvider errorMessage={errorMessage} isLoading={isLoading}>
        {children}
      </ModalContentProvider>
      {buttons?.length > 0 && (
        <ModalFooter>
          {buttons?.map(
            ({
              onClick,
              color = 'primary',
              text,
              id,
              disabled,
              variant = 'contained',
              type = 'button',
              component,
              to,
            }) => (
              <Button
                onClick={onClick}
                color={color}
                id={id}
                disabled={disabled}
                variant={variant}
                type={type}
                component={component}
                to={to}
              >
                {text}
              </Button>
            ),
          )}
        </ModalFooter>
      )}
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
      type: PropTypes.string,
      component: PropTypes.elementType,
      to: PropTypes.string,
    }),
  ),
};

Modal.defaultProps = {
  buttons: [],
  errorMessage: '',
  isLoading: false,
};
