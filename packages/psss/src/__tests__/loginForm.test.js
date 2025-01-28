import React from 'react';
import { screen, fireEvent, act } from '@testing-library/react';
import { loginUser } from '../api';
import { LoginForm } from '../containers';
import { render } from '../utils/test-utils';

jest.mock('../api');

describe('login form', () => {
  const testData = {
    email: 'tupaia@gmail.com',
    password: 'password123',
  };

  it('submits a login form with email and password field', async () => {
    loginUser.mockResolvedValueOnce({ user: { name: 'tupaia' } });
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login*/i });

    fireEvent.change(emailInput, { target: { value: testData.email } });
    fireEvent.change(passwordInput, { target: { value: testData.password } });

    await act(async () => {
      await fireEvent.click(submitButton);
    });

    expect(loginUser).toHaveBeenCalledWith({
      emailAddress: testData.email,
      password: testData.password,
      deviceName: window.navigator.userAgent,
    });

    expect(loginUser).toHaveBeenCalledTimes(1);
    loginUser.mockReset();
  });
});
