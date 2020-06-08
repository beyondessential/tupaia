/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { render } from 'test-utils';
import { fireEvent } from '@testing-library/react';
import { API } from '../../api';
import { LoginForm } from '../Forms';

jest.mock('../../api');

describe('login form', () => {
  const testData = {
    email: 'tupaia@gmail.com',
    password: 'password123',
  };

  it('submits a login form with email and password field', async () => {
    API.reauthenticate.mockResolvedValueOnce({ user: { name: 'tupaia' } });
    const { getByText, getByPlaceholderText } = render(<LoginForm />);

    const emailInput = getByPlaceholderText(/email/i);
    const passwordInput = getByPlaceholderText(/password/i);
    const submitButton = getByText(/login*/i).closest('button');

    fireEvent.change(emailInput, { target: { value: testData.email } });
    fireEvent.change(passwordInput, { target: { value: testData.password } });
    fireEvent.click(submitButton);

    expect(API.reauthenticate).toHaveBeenCalledWith({
      emailAddress: testData.email,
      password: testData.password,
      deviceName: window.navigator.userAgent,
    });

    expect(API.reauthenticate).toHaveBeenCalledTimes(1);
    API.reauthenticate.mockReset();
  });
});
