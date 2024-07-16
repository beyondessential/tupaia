/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button as UIButton } from '@tupaia/ui-components';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';

const Container = styled.div`
  text-align: center;
  padding: 0.5rem 0.5rem 1rem;
`;

const Image = styled.img.attrs({
  src: '/tupaia-high-five.svg',
  alt: 'Illustration of two hands giving a high five',
})`
  height: auto;
  max-width: 100%;
  width: 8rem;
  margin: 0 auto 1rem;
`;

const Text = styled(Typography)`
  text-align: center;
  font-size: 0.93rem;
  line-height: 1.5;
  margin-block-end: 1rem;
`;

const Button = styled(UIButton)`
  font-size: 0.75rem;
  max-width: 10rem;
  padding: 0.25rem 1rem;
`;
export const NoTasksSection = () => (
  <Container>
    <Image />
    <Text>
      Congratulations, you have no tasks to complete! You can view all other tasks for your project
      using the button below.
    </Text>
    <Button to={ROUTES.TASKS} component={Link}>
      View all tasks
    </Button>
  </Container>
);
