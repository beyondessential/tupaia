import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { To } from 'react-router';
import { Typography } from '@material-ui/core';
import { Button, Modal } from '.';

const Wrapper = styled.div`
  width: 25rem;
  max-width: 100%;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 0 2rem 1rem;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column-reverse;
  width: 100%;
  padding-top: 1.8rem;
  gap: 0.5rem;
  ${({ theme }) => theme.breakpoints.up('sm')} {
    flex-direction: row;
    justify-content: center;
  }
`;

const Heading = styled(Typography).attrs({
  variant: 'h2',
  align: 'center',
})`
  margin-bottom: 1rem;
`;

const ModalButton = styled(Button).attrs({
  fullWidth: true,
})`
  &.MuiButtonBase-root.MuiButton-root {
    margin-left: 0;
  }
`;

type ButtonProps = {
  onClick: () => void;
  label?: string;
  to?: To;
};
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  primaryButton?: ButtonProps | null;
  secondaryButton?: ButtonProps | null;
  children?: ReactNode;
  isLoading?: boolean;
}

export const SmallModal = ({
  open,
  onClose,
  title,
  primaryButton,
  secondaryButton,
  children,
  isLoading = false,
}: ModalProps) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Wrapper>
        {title && <Heading>{title}</Heading>}
        {children}
        <ButtonWrapper>
          {secondaryButton && (
            <ModalButton
              variant="outlined"
              to={secondaryButton.to}
              onClick={secondaryButton.onClick}
            >
              {secondaryButton.label}
            </ModalButton>
          )}
          {primaryButton && (
            <ModalButton onClick={primaryButton.onClick} isLoading={isLoading}>
              {primaryButton.label}
            </ModalButton>
          )}
        </ButtonWrapper>
      </Wrapper>
    </Modal>
  );
};
