/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from './Button';
import { SurveyTickIcon } from './Icons';

const ButtonWrapper = styled(Button)`
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
` as typeof Button;

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
  tooltip?: string;
  children: React.ReactNode;
}

export const Tile = ({ title, text, children, to, tooltip }: TileProps) => {
  return (
    <ButtonWrapper component={RouterLink} to={to} tooltip={tooltip}>
      <SurveyTickIcon />
      <div>
        <Heading>{title}</Heading>
        <Text>{text}</Text>
        {children}
      </div>
    </ButtonWrapper>
  );
};
