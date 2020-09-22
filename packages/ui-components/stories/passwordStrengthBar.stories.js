/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { PasswordStrengthBar } from '../src';

const Container = styled.div`
  margin: 1rem auto;
  max-width: 460px;
`;

export default {
  title: 'PasswordStrengthBar',
  component: PasswordStrengthBar,
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const PasswordStrengthBarTemplate = args => <PasswordStrengthBar {...args} />;

export const Simple = PasswordStrengthBarTemplate.bind({});
Simple.args = {
  password: 'gjnmhh6z4',
  helperText: 'New password must be over 8 characters long.',
};
