/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { ButtonProps, Dialog, DialogProps } from '@material-ui/core';
import { DialogFooter as BaseDialogFooter } from '../Dialog';
import { Button } from '../Button';
import { ModalContentProvider, ModalContentProviderProps } from './ModalContentProvider';
import { ModalHeader } from './ModalHeader';

export const ModalFooter = styled(BaseDialogFooter)`
  background-color: ${props => props.theme.palette.background.paper};
  padding-block: 1.3rem;
  padding-inline: 1.9rem;
`;

type ButtonT = Omit<ButtonProps, 'variant'> & {
  id: string;
  text: string;
  component?: React.ElementType;
  to?: string;
  type?: string;
  variant?: string; // declare as a string here because passing 'contained' or 'outlined' is coming up as invalid elsewhere
};

interface ModalProps extends Omit<DialogProps, 'onClose' | 'open'> {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
  isLoading?: boolean;
  error?: ModalContentProviderProps['error'];
  buttons?: ButtonT[];
}

export const Modal = ({
  children,
  isOpen,
  onClose,
  title,
  isLoading,
  error,
  buttons = [],
  ...muiDialogProps
}: ModalProps) => {
  const getModalTitle = () => {
    if (error) {
      return title || 'Error';
    }
    return title;
  };

  const modalTitle = getModalTitle();
  return (
    <Dialog onClose={onClose} open={isOpen} fullWidth {...muiDialogProps}>
      <ModalHeader onClose={onClose} title={modalTitle} />
      <ModalContentProvider error={error} isLoading={isLoading}>
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
                key={id}
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
