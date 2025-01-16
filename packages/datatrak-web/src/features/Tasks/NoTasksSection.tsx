import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button as UIButton } from '@tupaia/ui-components';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';

const DesktopContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;

  ${({ theme }) => theme.breakpoints.down('sm')} {
    display: none;
  }
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
  <DesktopContainer>
    <Image />
    <Text>
      Congratulations, you have no tasks to complete! You can view all other tasks for your project
      using the button below.
    </Text>
    <Button to={ROUTES.TASKS} component={Link}>
      View all tasks
    </Button>
  </DesktopContainer>
);

const MobileContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  p {
    flex: 1;
    text-align: left;
    margin-inline-end: 1rem;
    margin-block-end: 0;
    font-size: 0.75rem;
  }

  a.MuiButtonBase-root {
    display: inline-block;
    margin-block-end: 0;
  }

  ${({ theme }) => theme.breakpoints.up('md')} {
    display: none;
  }
`;

const Mobile = () => (
  <MobileContainer>
    <Text>You have no tasks to complete.</Text>
    <Button to={ROUTES.TASKS} component={Link}>
      View all tasks
    </Button>
  </MobileContainer>
);

export const NoTasksSection = () => (
  <>
    <Desktop />
    <Mobile />
  </>
);
