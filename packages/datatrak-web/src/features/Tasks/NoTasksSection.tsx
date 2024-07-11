/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { FlexColumn } from '@tupaia/ui-components';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { Button } from '../../components';

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
  font-size: 15px;
  line-height: 22px;
  margin-bottom: 1rem;
`;
export const NoTasksSection = () => (
  <FlexColumn>
    <Image />
    <Text>
      Congratulations, you have no tasks to complete! You can view all other tasks for your project
      using the button below.
    </Text>
    <Button to={ROUTES.TASKS} component={Link}>
      View all tasks
    </Button>
  </FlexColumn>
);
