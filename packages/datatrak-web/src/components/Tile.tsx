/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ComponentType, ReactNode } from 'react';
import styled from 'styled-components';
import { Typography, Box } from '@material-ui/core';
import { Button } from './Button';

const ButtonWrapper = styled(Button)`
  display: flex;
  position: relative;
  justify-content: flex-start;
  align-items: flex-start;
  background: ${({ theme }) => theme.palette.background.paper};
  padding: 0.8rem 1rem;
  border-radius: 0.625rem;
  font-size: 0.75rem;
  font-weight: 400;
  color: ${({ theme }) => theme.palette.text.secondary};
  overflow: hidden;

  svg {
    margin-right: 0.4rem;
    margin-top: 0.2rem;
  }

  &:hover {
    background-color: ${({ theme }) => theme.palette.primaryHover};
  }
` as typeof Button;

const Heading = styled(Typography)`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.primary};
  margin-bottom: 0.2rem;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Text = styled(Typography)`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  text-align: left;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  &:not(:last-child) {
    margin-bottom: 0.2rem;
  }
`;

interface TileProps {
  title: string;
  text: string;
  to?: string;
  tooltip?: ReactNode;
  children?: ReactNode;
  Icon?: ComponentType;
  onClick?: () => void;
}

export const Tile = ({ title, text, children, to, tooltip, Icon, onClick }: TileProps) => {
  return (
    <ButtonWrapper to={to} tooltip={tooltip} onClick={onClick}>
      {Icon && <Icon />}
      <Box maxWidth="100%" pr={5}>
        <Heading>{title}</Heading>
        <Text>{text}</Text>
        {children && <Text>{children}</Text>}
      </Box>
    </ButtonWrapper>
  );
};
