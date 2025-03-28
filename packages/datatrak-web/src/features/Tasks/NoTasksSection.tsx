import { Typography } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Button as UIButton } from '@tupaia/ui-components';

import { ROUTES } from '../../constants';
import { useIsMobile } from '../../utils';

const Section = styled.section`
  align-items: center;
  display: flex;
  text-wrap: balance;
`;

const DesktopWrapper = styled(Section)`
  block-size: 100%;
  flex-direction: column;
`;

const DecorativeImage = styled.img.attrs({
  'aria-hidden': true,
  src: '/tupaia-high-five.svg',
})`
  flex: 1;
  height: auto;
  min-height: 5rem;
  width: auto;
  margin: 0 auto 1rem;
`;

const Text = styled(Typography)`
  text-align: center;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-block-end: 0.5rem;
`;

const Button = styled(UIButton)`
  padding: 0.25rem 1rem;
  margin-block-end: 0.5rem;

  .MuiButton-label {
    font-size: 0.75rem;
  }
`;

const Desktop = () => (
  <DesktopWrapper>
    <DecorativeImage />
    <Text>
      Congratulations, you have no tasks to complete! You can view all other tasks for your project
      using the button below.
    </Text>
    <Button to={ROUTES.TASKS} component={Link}>
      View all tasks
    </Button>
  </DesktopWrapper>
);

const MobileWrapper = styled(Section)`
  justify-content: space-between;

  p {
    flex: 1;
    text-align: start;
    margin-inline-end: 1rem;
    margin-block-end: 0;
    font-size: 0.75rem;
  }

  a.MuiButtonBase-root {
    display: inline-block;
    margin-block-end: 0;
  }
`;

const Mobile = () => (
  <MobileWrapper>
    <Text>You have no tasks to complete</Text>
    <Button to={ROUTES.TASKS} component={Link}>
      View all tasks
    </Button>
  </MobileWrapper>
);

export const NoTasksSection = () => (useIsMobile() ? <Mobile /> : <Desktop />);
