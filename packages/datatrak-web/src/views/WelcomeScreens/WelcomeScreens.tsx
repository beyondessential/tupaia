import { Button as MuiButton } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Button as UIButton } from '@tupaia/ui-components';

import { useCurrentUserContext, useEditUser } from '../../api';
import { PageContainer } from '../../components';
import { ROUTES } from '../../constants';
import { Carousel } from './Carousel';

const steps = [
  {
    title: 'Welcome to Tupaia DataTrak!',
    text: 'If you’re here from MediTrak, welcome! Rest assured that you have all the same functionality as MediTrak, only better. Come for a quick tour of what’s new.',
    imgPath: 'images/data-collection-woman.svg',
    imgIntrinsicWidth: 336,
    imgIntrinsicHeight: 470,
  },
  {
    title: 'Sync status',
    text: 'See your last sync and which surveys are pending sync on your home page. Use the sync button on the top right to manually sync your device.',
    imgPath: 'images/pig-on-beach.svg',
    imgIntrinsicWidth: 336,
    imgIntrinsicHeight: 336,
  },
  {
    title: 'Submission history',
    text: 'Quickly see and access your recently submitted surveys under the ‘Submission history’ section on the dashboard',
    imgPath: 'images/digital-update.svg',
    imgIntrinsicWidth: 336,
    imgIntrinsicHeight: 336,
  },
  {
    title: 'Projects',
    text: 'From the home screen you can see which project you’re in. Click on the project to swap to a different project.',
    imgPath: 'images/data-collection-man.svg',
    imgIntrinsicWidth: 336,
    imgIntrinsicHeight: 336,
  },
] as const;

const Container = styled.div`
  block-size: 100dvb;
  display: flex;
  flex-direction: column;
  margin-inline: auto;
  max-inline-size: 30rem;
  text-align: center;
`;

const Header = styled(PageContainer).attrs({ as: 'header' })`
  display: flex;
  flex: initial;
  justify-content: flex-end;
  padding-bottom: 1rem;
  padding-top: max(env(safe-area-inset-top, 0), 1rem);
`;

const Body = styled(PageContainer).attrs({ as: 'main' })`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
`;

const Footer = styled(PageContainer)`
  flex: initial;
  margin-block-start: 2.5rem;
  padding-bottom: calc(env(safe-area-inset-bottom, 0) + 2.5rem);
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
