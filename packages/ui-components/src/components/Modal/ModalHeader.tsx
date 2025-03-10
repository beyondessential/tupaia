import React, { ReactNode } from 'react';
import { Typography } from '@material-ui/core';
import styled from 'styled-components';
import { Close } from '@material-ui/icons';
import { FlexStart } from '../Layout';
import { IconButton } from '../IconButton';

const Header = styled(FlexStart)`
  position: relative;
  padding: 1.1rem 1.3rem 0.9rem;
`;

const Title = styled(Typography)`
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  font-size: 1rem;
`;

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0;
  right: 0;
  color: ${props => props.theme.palette.text.secondary};
`;

interface ModalHeaderProps {
  title?: string;
  onClose: () => void;
  children?: ReactNode;
}

export const ModalHeader = ({ title, onClose, children }: ModalHeaderProps) => (
  <Header>
    {title && <Title variant="h2">{title}</Title>}
    {children}
    <CloseButton onClick={onClose} aria-label="Close modal">
      <Close />
    </CloseButton>
  </Header>
);
