/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import { Typography, Box } from '@material-ui/core';
import { Button } from './Button';
import { SurveyTickIcon } from './Icons';

const ButtonWrapper = styled(Button)`
  display: flex;
  position: relative;
  justify-content: flex-start;
  align-items: flex-start;
  background: ${({ theme }) => theme.palette.background.paper};
  margin-bottom: 1rem;
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
  margin-bottom: 0.2rem;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface TileProps {
  title: string;
  text: string;
  to: string;
  tooltip?: ReactNode;
  children: ReactNode;
}

export const Tile = ({ title, text, children, to, tooltip }: TileProps) => {
  return (
    <ButtonWrapper component={RouterLink} to={to} tooltip={tooltip}>
      <SurveyTickIcon />
      <Box maxWidth="100%" pr={5}>
        <Heading>{title}</Heading>
        <Text>{text}</Text>
        <Text>{children}</Text>
      </Box>
    </ButtonWrapper>
  );
};
