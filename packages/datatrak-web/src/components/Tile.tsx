/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { ButtonBase } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import { SurveyTickIcon } from './Icons';

const Container = styled(ButtonBase)`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  background: white;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 0.625rem;
  font-size: 0.75rem;
  font-weight: 400;
  color: ${({ theme }) => theme.palette.text.secondary};

  svg {
    margin-right: 0.5rem;
  }

  &:hover {
    background: #328de515;
  }
` as typeof ButtonBase;

const Heading = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const Text = styled.div`
  color: ${({ theme }) => theme.palette.text.secondary};
`;

interface TileProps {
  title: string;
  text: string;
  to: string;
  children: React.ReactNode;
}

export const Tile = ({ title, text, children, to }: TileProps) => {
  return (
    <Container component={RouterLink} to={to}>
      <SurveyTickIcon />
      <div>
        <Heading>{title}</Heading>
        <Text>{text}</Text>
        {children}
      </div>
    </Container>
  );
};
