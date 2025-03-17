import React, { ComponentPropsWithoutRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: 0.5rem;
  height: 0.5rem;
  border-radius: calc(infinity * 1px);
  background-color: ${({ theme, $active }) =>
    $active ? theme.palette.primary.main : theme.palette.divider};
  border: none;
  cursor: pointer;
  padding: 0;
`;

interface CarouselDotsProps extends ComponentPropsWithoutRef<typeof Container> {
  maxSteps: number;
  activeStep: number;
  onClick: (index: number) => void;
}

export const CarouselDots = ({ maxSteps, activeStep, onClick, ...props }: CarouselDotsProps) => {
  return (
    <Container {...props}>
      {Array.from({ length: maxSteps }, (_, i) => (
        <Dot key={i} $active={i === activeStep} onClick={() => onClick(i)} />
      ))}
    </Container>
  );
};
