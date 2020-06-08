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

describe('login form', () => {
  it('renders', () => {
    render(<LoginForm />);
  });

  const testData = {
    email: 'tupaia@gmail.com',
    password: 'password123',
  };

  it('submits a login form with email field, password field and submit button', async () => {
    mockAPI.reauthenticate.mockResolvedValueOnce({ user: { name: 'tupaia' } });
    const { getByPlaceholderText, getByText } = render(<LoginForm />);
    const emailInput = getByPlaceholderText(/email/i);
    const passwordInput = getByPlaceholderText(/password/i);
    const submitButton = getByText(/login to your account/i).closest('button');

    fireEvent.change(emailInput, { target: { value: testData.email } });
    fireEvent.change(passwordInput, { target: { value: testData.password } });
    fireEvent.click(submitButton);

    expect(mockAPI.reauthenticate).toHaveBeenCalledWith({
      emailAddress: testData.email,
      password: testData.password,
      deviceName: window.navigator.userAgent,
    });

    expect(mockAPI.reauthenticate).toHaveBeenCalledTimes(1);
    mockAPI.reauthenticate.mockReset();
  });
});
