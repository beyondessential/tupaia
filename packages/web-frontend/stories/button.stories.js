/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import MuiBox from '@material-ui/core/Box';
import styled from 'styled-components';
import { PrimaryButton } from '../src/components/Buttons';
import { SubmitButton } from '../src/containers/Form/common';

const Container = styled(MuiBox)`
  padding: 1rem;
`;

export default {
  title: 'Button',
  component: PrimaryButton,
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const PrimaryButtonTemplate = args => <PrimaryButton {...args} />;

export const Primary = PrimaryButtonTemplate.bind({});
Primary.args = {
  children: 'Button',
};
Primary.argTypes = { onClick: { action: 'clicked' } };

const SubmitButtonTemplate = args => <SubmitButton {...args} />;

export const Submit = SubmitButtonTemplate.bind({});
Submit.args = {
  text: 'Submit',
};
Submit.argTypes = { handleClick: { action: 'clicked' } };
