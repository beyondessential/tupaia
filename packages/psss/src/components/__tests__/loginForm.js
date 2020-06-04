/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { render } from 'test-utils';
import { fireEvent } from '@testing-library/react';
import { API as mockAPI } from '../../api';
import { LoginForm } from '../Forms';

jest.mock('../../api');

test('renders login form', () => {
  render(<LoginForm />);
});

test('submits a login form with email field, password field and submit button', async () => {
  mockAPI.reauthenticate.mockResolvedValueOnce({ user: { name: 'tupaia' } });

  const { getByPlaceholderText, getByText } = render(<LoginForm />);
  const emailInput = getByPlaceholderText(/email/i);
  const passwordInput = getByPlaceholderText(/password/i);
  const submitButton = getByText(/login to your account/i).closest('button');

  fireEvent.change(emailInput, { target: { value: 'tupaia@gmail.com' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  fireEvent.click(submitButton);

  expect(mockAPI.reauthenticate).toHaveBeenCalledWith({
    emailAddress: 'tupaia@gmail.com',
    password: 'password123',
    deviceName: window.navigator.userAgent,
  });

  expect(mockAPI.reauthenticate).toHaveBeenCalledTimes(1);

  mockAPI.reauthenticate.mockReset();
});
