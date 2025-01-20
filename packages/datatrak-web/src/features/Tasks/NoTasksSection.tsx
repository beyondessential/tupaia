import { Typography } from '@material-ui/core';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { Button as UIButton } from '@tupaia/ui-components';

import { ROUTES } from '../../constants';
import { useIsMobile } from '../../utils';

const Section = styled.section`
  display: flex;
  align-items: center;
`;

const DesktopWrapper = styled(Section)`
  flex-direction: column;
  height: 100%;
`;

const Image = styled.img.attrs({
  src: '/tupaia-high-five.svg',
  alt: 'Illustration of two hands giving a high five',
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
    <Image />
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
    {/* Todo: Add button back when mobile tasks are ready */}
    {/*<Button to={ROUTES.TASKS} component={Link}>*/}
    {/*  View all tasks*/}
    {/*</Button>*/}
  </MobileWrapper>
);

export const NoTasksSection = () => (useIsMobile() ? <Mobile /> : <Desktop />);
