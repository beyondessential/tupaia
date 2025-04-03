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
    imgMediaType: 'image/svg+xml',
  },
  {
    title: 'Sync status',
    text: 'See your last sync and which surveys are pending sync on your home page. Use the sync button on the top right to manually sync your device.',
    imgPath: 'images/pig-on-beach.svg',
    imgIntrinsicWidth: 336,
    imgIntrinsicHeight: 336,
    imgMediaType: 'image/svg+xml',
  },
  {
    title: 'Submission history',
    text: (
      <>
        Quickly see and access your recently submitted surveys under the{' '}
        <strong>Submission history</strong> section on the dashboard.
      </>
    ),
    imgPath: 'images/digital-update.svg',
    imgIntrinsicWidth: 336,
    imgIntrinsicHeight: 336,
    imgMediaType: 'image/svg+xml',
  },
  {
    title: 'Projects',
    text: 'From the home screen you can see which project you’re in. Click on the project to swap to a different project.',
    imgPath: 'images/data-collection-man.svg',
    imgIntrinsicWidth: 336,
    imgIntrinsicHeight: 336,
    imgMediaType: 'image/svg+xml',
  },
] as const;

const Container = styled.div`
  block-size: 100dvb;
  display: flex;
  flex-direction: column;
  inline-size: 100dvi;
  margin-inline: auto;
  max-inline-size: 30rem;
  padding-top: max(env(safe-area-inset-top, 0), 1rem);
  text-align: center;
`;

const Header = styled.header`
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 50%;
  translate: -50%;

  padding-left: max(env(safe-area-inset-left, 0), 1.25rem);
  padding-right: max(env(safe-area-inset-right, 0), 1.25rem);
  padding-top: max(env(safe-area-inset-top, 0), 1rem);

  align-items: center;
  display: flex;
  inline-size: 100%;
  justify-content: flex-end;
  max-inline-size: inherit;

  // Header should be semantically ordered before carousel, but that causes the carousel to be
  // painted over this element
  z-index: 1;
`;

const TextButton = styled(MuiButton)`
  font-size: 0.75rem;
  font-weight: 400;
`;

const Footer = styled(PageContainer).attrs({ as: 'footer' })`
  flex: initial;
  margin-block-start: 0.5rem;
  padding-bottom: calc(env(safe-area-inset-bottom, 0) + 1.5rem);
`;

const StyledButton = styled(UIButton)`
  transform: translateY(0);
  transition-behavior: allow-discrete;
  transition-property: opacity, transform, visibility;
  transition: 200ms var(--ease-out-quad);

  &[hidden] {
    visibility: hidden;
    opacity: 25%;
    transform: translateY(20%);
  }
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
      <Carousel steps={steps} activeStep={activeStep} handleStepChange={handleStepChange} />
      <Footer>
        <StyledButton onClick={onComplete} fullWidth hidden={!isLastStep}>
          Go to Tupaia DataTrak
        </StyledButton>
      </Footer>
    </Container>
  );
};
