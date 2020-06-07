/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { render, loggedInRender } from 'test-utils';
import { fireEvent, waitFor } from '@testing-library/react';
import { API as mockAPI } from '../api/singletons';
import App from '../App';

jest.mock('../api/TupaiaApi');

const response = {
  user: {
    id: '5e729d5a61f76a411c026bd8',
    name: 'Tom Caiger',
    email: 'caigertom@gmail.com',
    verifiedEmail: 'verified',
  },
  accessToken: '1',
  refreshToken: '1',
};

const testData = {
  email: 'tupaia@gmail.com',
  password: 'password123',
};

test('Can view and update weekly reports', async () => {
  mockAPI.reauthenticate.mockResolvedValueOnce(response);
  const { getByPlaceholderText, getByText, findByText } = render(<App />);

  // debug();
  const emailInput = getByPlaceholderText(/email/i);
  const passwordInput = getByPlaceholderText(/password/i);
  const submitButton = getByText(/login*/i).closest('button');
  fireEvent.change(emailInput, { target: { value: testData.email } });
  fireEvent.change(passwordInput, { target: { value: testData.password } });
  fireEvent.click(submitButton);

  await findByText(/countries/i);
  expect(getByText(/countries/i)).toBeInTheDocument();
});
