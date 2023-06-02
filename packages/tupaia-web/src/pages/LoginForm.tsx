/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Form } from 'react-router-dom';
import styled from 'styled-components';
import { TextField, Button } from '@tupaia/ui-components';
import { get, post } from '../api';

const Container = styled.div`
  background: #2e2f33;
  margin: 1rem auto;
  max-width: 1000px;
  height: 600px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StyledImg = styled.img`
  height: 2.6rem;
  width: auto;
  margin-bottom: 2.5rem;
`;
const Logo = () => <StyledImg src="/tupaia-logo-light.svg" alt="psss-logo" />;

const Title = styled.h1`
  font-weight: 500;
  font-size: 32px;
  line-height: 13px;
`;

const Text = styled.h2`
  font-weight: 400;
  font-size: 14px;
  line-height: 18px;
`;

const FormContainer = styled.div`
  margin-top: 1rem;
`;

export async function action({ request }) {
  const formData = await request.formData();
  const { email, password } = Object.fromEntries(formData);

  await post('login', {
    data: {
      emailAddress: email,
      password,
      deviceName: window.navigator.userAgent,
    },
  });

  const user = get('getUser');
  console.log('user', user);
  return user;
}
export const LoginForm = () => {
  return (
    <Container>
      <Logo />
      <Title>Log in</Title>
      <Text>Enter your details below to log in</Text>
      <FormContainer>
        <Form method="post">
          <TextField name="email" label="email" type="email" />
          <TextField name="password" label="password" type="password" />
          <Button type="submit">Submit</Button>
        </Form>
      </FormContainer>
    </Container>
  );
};
