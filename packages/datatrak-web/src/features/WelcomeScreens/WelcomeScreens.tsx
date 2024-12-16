/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, Button as MuiButton } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import { CarouselDots } from './CarouselDots';

const tutorialSteps = [
  {
    title: 'Welcome to Tupaia DataTrak!',
    text: "If you're here from MediTrak, welcome! Rest assured that you have all the same functionality as MediTrak, only better. Come for a quick tour of what's new.",
    imgPath: 'images/data-collection-woman.svg',
  },
  {
    title: 'Sync Status',
    text: 'See your last sync and which surveys are pending sync on your home page. Use the sync button on the top right to manually sync your device.',
    imgPath: 'images/pig-on-beach.svg',
  },
  {
    title: 'Submission history',
    text: 'Quickly see and access your recently submitted surveys under the ‘Submission history’ section on the dashboard',
    imgPath: 'images/digital-update.svg',
  },
  {
    title: 'Projects',
    text: "From the home screen you can see which project you're in. Click on the project to swap to a different project.",
    imgPath: 'images/data-collection-man.svg',
  },
];

const Container = styled.div`
  text-align: center;
  padding: 2rem;
`;

const Title = styled(Typography).attrs({
  variant: 'h1',
})`
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const Text = styled(Typography)`
  font-size: 0.875rem;
`;

const Image = styled.img`
  max-width: 100%;
`;

const Button = styled(MuiButton)`
  width: 100%;
`;

export const WelcomeScreens = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleStepChange = step => {
    setActiveStep(step);
  };
  return (
    <Container>
      <SwipeableViews index={activeStep} onChangeIndex={handleStepChange} enableMouseEvents>
        {tutorialSteps.map((step, index) => (
          <div key={step.title}>
            {Math.abs(activeStep - index) <= 2 ? (
              <Image src={step.imgPath} alt={step.title} />
            ) : null}
          </div>
        ))}
      </SwipeableViews>
      <Title>{tutorialSteps[activeStep].title}</Title>
      <Text>{tutorialSteps[activeStep].text}</Text>
      <CarouselDots
        maxSteps={tutorialSteps.length}
        activeStep={activeStep}
        onClick={handleStepChange}
      />
    </Container>
  );
};
