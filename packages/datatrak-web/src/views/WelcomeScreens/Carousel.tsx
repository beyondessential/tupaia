import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { CarouselDots } from './CarouselDots';

const Inner = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  inline-size: 100%;
  justify-content: center;
  max-inline-size: 100%;
  padding-inline: 0.5rem;
`;

const Title = styled(Typography).attrs({
  variant: 'h1',
})`
  font-size: 1rem;
  margin-block-end: 1rem;
`;

const Text = styled(Typography)`
  font-size: 0.875rem;
  block-size: 5rem;
  text-wrap: balance;
`;

interface CarouselStep {
  title: string;
  text: string;
  imgPath: string;
}

interface CarouselProps {
  steps: CarouselStep[];
  activeStep: number;
  handleStepChange: (step: number) => void;
}

export const Carousel = ({ steps, activeStep, handleStepChange }: CarouselProps) => {
  return (
    <>
      <SwipeableViews index={activeStep} onChangeIndex={handleStepChange} enableMouseEvents>
        {steps.map((step: CarouselStep) => (
          <Inner key={step.title}>
            <ImageContainer>
              <img src={step.imgPath} alt={step.title} />
            </ImageContainer>
            <Title>{steps[activeStep].title}</Title>
            <Text>{steps[activeStep].text}</Text>
          </Inner>
        ))}
      </SwipeableViews>
      <CarouselDots maxSteps={steps.length} activeStep={activeStep} onClick={handleStepChange} />
    </>
  );
};
