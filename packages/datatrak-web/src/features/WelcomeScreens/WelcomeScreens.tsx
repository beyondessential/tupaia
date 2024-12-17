/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, Button as MuiButton } from '@material-ui/core';
import { Button as BaseButton } from '../../components';
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
  display: flex;
  flex-direction: column;
  text-align: center;
  height: 100vh;
  max-width: 30rem;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.8rem;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 1.8rem;
`;

const Inner = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const Footer = styled.div`
  height: 6rem;
  padding: 0 2rem 1rem;
`;

const ImageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 0.5rem;
  width: 100%;
  max-width: 100%;
`;

const Title = styled(Typography).attrs({
  variant: 'h1',
})`
  font-size: 1rem;
  margin-bottom: 1rem;
`;

const Text = styled(Typography)`
  font-size: 0.875rem;
  height: 5rem;
`;

const Button = styled(BaseButton)`
  width: 100%;
`;

export const WelcomeScreens = () => {
  const [activeStep, setActiveStep] = useState(0);

  const handleStepChange = step => {
    setActiveStep(step);
  };

  const handleSkip = () => {
    console.log('skip');
  };

  return (
    <Container>
      <Header>
        <MuiButton onClick={handleSkip}>Skip</MuiButton>
      </Header>
      <Body>
        <SwipeableViews index={activeStep} onChangeIndex={handleStepChange} enableMouseEvents>
          {tutorialSteps.map(step => (
            <Inner key={step.title}>
              <ImageContainer>
                <img src={step.imgPath} alt={step.title} />
              </ImageContainer>
              <Title>{tutorialSteps[activeStep].title}</Title>
              <Text>{tutorialSteps[activeStep].text}</Text>
            </Inner>
          ))}
        </SwipeableViews>
        <CarouselDots
          maxSteps={tutorialSteps.length}
          activeStep={activeStep}
          onClick={handleStepChange}
        />
      </Body>
      <Footer>
        <Button color="primary" variant="contained">
          Go to Tupaia DataTrak
        </Button>
      </Footer>
    </Container>
  );
};
