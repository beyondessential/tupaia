/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button as MuiButton } from '@material-ui/core';
import { useNavigate } from 'react-router-dom';
import { Button as UIButton } from '@tupaia/ui-components';
import { Carousel } from './Carousel';
import { useCurrentUserContext, useEditUser } from '../../api';
import { ROUTES } from '../../constants';

const steps = [
  {
    title: 'Welcome to Tupaia DataTrak!',
    text: 'If you’re here from MediTrak, welcome! Rest assured that you have all the same functionality as MediTrak, only better. Come for a quick tour of what’s new.',
    imgPath: 'images/data-collection-woman.svg',
  },
  {
    title: 'Sync status',
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
    text: 'From the home screen you can see which project you’re in. Click on the project to swap to a different project.',
    imgPath: 'images/data-collection-man.svg',
  },
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  text-align: center;
  block-size: 100vh;
  max-inline-size: 30rem;
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

const Footer = styled.div`
  block-size: 6rem;
  padding: 0 2rem 1rem;
`;

const TextButton = styled(MuiButton)`
  font-weight: 400;
  font-size: 0.75rem;
`;

export const WelcomeScreens = () => {
  const [activeStep, setActiveStep] = useState(0);
  const navigate = useNavigate();
  const user = useCurrentUserContext();
  const { mutate: updateUser } = useEditUser();

  useEffect(() => {
    updateUser({ hideWelcomeScreen: true });
  }, []);

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };

  const onComplete = () => {
    const route = user.projectId ? ROUTES.HOME : ROUTES.PROJECT_SELECT;
    navigate(route);
  };

  const isLastStep = activeStep === steps.length - 1;

  return (
    <Container>
      <Header>
        <TextButton onClick={onComplete}>Skip</TextButton>
      </Header>
      <Body>
        <Carousel steps={steps} activeStep={activeStep} handleStepChange={handleStepChange} />
      </Body>
      <Footer>
        {isLastStep && (
          <UIButton onClick={onComplete} fullWidth>
            Go to Tupaia DataTrak
          </UIButton>
        )}
      </Footer>
    </Container>
  );
};
