/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { SurveyIcon } from './Icons';

const Container = styled.div`
  display: flex;
  background: white;
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 10px;

  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.palette.text.secondary};

  svg {
    margin-right: 0.5rem;
  }
`;

const Heading = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.palette.text.primary};
`;

const Text = styled.div`
  background: white;
  border-radius: 10px;

  color: ${({ theme }) => theme.palette.text.secondary};
`;

interface TileProps {
  title: string;
  text: string;
  link: string;
  children: React.ReactNode;
}

export const Tile = ({ title, text, children, link }: TileProps) => {
  console.log('link', link);
  return (
    <Container>
      <SurveyIcon />
      <div>
        <Heading>{title}</Heading>
        <Text>{text}</Text>
        {children}
      </div>
    </Container>
  );
};
