/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Form } from '../../src/containers/Form';
import { TextField } from '../../src/containers/Form/Fields';
import { SubmitButton } from '../../src/containers/Form/common';
import { DARK_BLUE } from '../../src/styles';

const Container = styled.div`
  margin: 1rem auto;
  width: 600px;
  height: 400px;
  background: ${DARK_BLUE};
  padding: 3rem;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 18px;
`;

export default {
  title: 'Form/Form',
  component: Form,
  argTypes: { onSubmit: { action: 'submitted' } },
  decorators: [
    Story => (
      <Container>
        <Story />
      </Container>
    ),
  ],
};

const Template = args => <Form {...args} />;

export const SimpleForm = Template.bind({});
SimpleForm.args = {
  render: () => (
    <>
      <TextField name="firstName" label="First Name" />
      <TextField name="lastName" label="Last Name" />
      <SubmitButton text="Submit" gutterTop />
    </>
  ),
  Grid: FormGrid,
};
