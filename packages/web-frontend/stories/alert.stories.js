/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import MoodBadIcon from '@material-ui/icons/MoodBad';
import { Alert } from '../src/components/Alert';
import { CheckCircle } from '@material-ui/icons';

const Container = styled(MuiBox)`
  padding: 1rem;
`;

export default {
  title: 'Alert',
  component: Alert,
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const Template = args => <Alert {...args} />;

export const Success = Template.bind({});
Success.args = {
  children: 'This is a success alert - check it out!',
};

export const Info = Template.bind({});
Info.args = {
  children: 'This is an info alert - check it out!',
  severity: 'info',
};

export const Warning = Template.bind({});
Warning.args = {
  children: 'This is a warning alert - check it out!',
  severity: 'warning',
};

export const Error = Template.bind({});
Error.args = {
  children: 'This is an error alert - check it out!',
  severity: 'error',
};

export const CustomIcons = Template.bind({});
CustomIcons.args = {
  children: 'This is an error alert - check it out!',
  severity: 'error',
  iconMapping: {
    error: <MoodBadIcon fontSize="inherit" />,
  },
};
