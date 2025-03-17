import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { CarouselDots } from './CarouselDots';

const Swipeable = styled(SwipeableViews)`
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;

const Inner = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const Image = styled.img`
  aspect-ratio: 336 / 470;
  height: auto;
  margin-inline: auto;
  max-height: 55dvh;
  max-width: 100%;
  object-fit: contain;
  object-position: bottom;
  width: 100%;

  // Generally considered inaccessible, but swiping between steps is more important
  user-drag: none;
`;

const Title = styled(Typography).attrs({
  variant: 'h1',
})`
  font-size: 1rem;
  margin-block-start: 2rem;
`;

const Text = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1.5;
  margin-block-start: 1em;
  min-block-size: 3lh;
  text-wrap: balance;
`;

const StyledCarouselDots = styled(CarouselDots)`
  margin-block-start: 1rem;
`;

interface CarouselStep {
  readonly title: React.ReactNode;
  readonly text: React.ReactNode;
  readonly imgPath: React.ImgHTMLAttributes<HTMLImageElement>['src'];
  readonly imgIntrinsicWidth?: React.ImgHTMLAttributes<HTMLImageElement>['width'];
  readonly imgIntrinsicHeight?: React.ImgHTMLAttributes<HTMLImageElement>['height'];
  readonly imgMediaType?: React.SourceHTMLAttributes<HTMLSourceElement>['type'];
}

interface CarouselProps {
  steps: readonly CarouselStep[];
  activeStep: number;
  handleStepChange: (step: number) => void;
}

export const Carousel = ({ steps, activeStep, handleStepChange }: CarouselProps) => {
  return (
    <>
      <Swipeable index={activeStep} onChangeIndex={handleStepChange} enableMouseEvents>
        {steps.map((step, index) => (
          <Inner key={index}>
            <picture aria-hidden>
              <source src={step.imgPath} type={step.imgMediaType} />
              <Image
                aria-hidden
                src={step.imgPath}
                width={step.imgIntrinsicWidth}
                height={step.imgIntrinsicHeight}
              />
            </picture>
            <Title>{steps[activeStep].title}</Title>
            <Text>{steps[activeStep].text}</Text>
          </Inner>
        ))}
      </Swipeable>
      <StyledCarouselDots
        maxSteps={steps.length}
        activeStep={activeStep}
        onClick={handleStepChange}
      />
    </>
  );
};
