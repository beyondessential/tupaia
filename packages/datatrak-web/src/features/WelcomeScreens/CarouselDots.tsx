/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  padding-bottom: 1rem;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background-color: ${({ theme, $active }) =>
    $active ? theme.palette.primary.main : theme.palette.divider};
  border: none;
  cursor: pointer;
  padding: 0;
`;

interface CarouselDotsProps {
  maxSteps: number;
  activeStep: number;
  onClick: (index: number) => void;
}

export const CarouselDots: React.FC<CarouselDotsProps> = ({ maxSteps, activeStep, onClick }) => {
  return (
    <Container>
      {Array.from({ length: maxSteps }, (_, i) => (
        <Dot key={i} $active={i === activeStep} onClick={() => onClick(i)} />
      ))}
    </Container>
  );
};
