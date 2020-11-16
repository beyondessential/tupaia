/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { LoginFormComponent } from '../../src/containers/LoginForm/LoginFormComponent';
import { EmailVerificationComponent } from '../../src/containers/EmailVerification/EmailVerification';
import { RequestResetPasswordFormComponent } from '../../src/containers/RequestResetPasswordForm/RequestResetPasswordFormComponent';
import { RequestProjectAccessComponent } from '../../src/containers/OverlayDiv/components/RequestProjectAccessDialog';
import { SignupFormComponent } from '../../src/containers/SignupForm/SignupFormComponent';
import { DARK_BLUE } from '../../src/styles';
import { Form } from '../../src/containers/Form';

const MockOverlayDiv = styled.div`
  color: rgba(255, 255, 255, 0.9);
  margin: 0 auto;
  width: 600px;
  background: ${DARK_BLUE};
  padding: 1rem 1rem 1.5rem;
  text-align: center;
`;

export default {
  title: 'Form/LandingPageForms',
  component: Form,
  decorators: [
    Story => (
      <MockOverlayDiv>
        <Story />
      </MockOverlayDiv>
    ),
  ],
};

const LoginFormTemplate = args => (
  <MockOverlayDiv>
    <LoginFormComponent {...args} />
  </MockOverlayDiv>
);

export const LoginForm = LoginFormTemplate.bind({});
LoginForm.args = {
  isRequestingLogin: false,
};
LoginForm.argTypes = {
  onAttemptUserLogin: { action: 'submitted' },
  onClickResetPassword: { action: 'reset clicked' },
};

const RequestResetPasswordFormTemplate = args => <RequestResetPasswordFormComponent {...args} />;

export const RequestResetPasswordForm = RequestResetPasswordFormTemplate.bind({});
RequestResetPasswordForm.args = {
  resetPasswordFailedMessage: '',
  hasResetPasswordCompleted: false,
};
RequestResetPasswordForm.argTypes = {
  onAttemptResetPassword: { action: 'submitted' },
  onClickCancel: { action: 'cancelled' },
};

const RequestProjectAccessTemplate = args => <RequestProjectAccessComponent {...args} />;

export const RequestProjectAccess = RequestProjectAccessTemplate.bind({});
RequestProjectAccess.args = {
  success: true,
  project: {
    name: 'Laos Schools',
    code: 'laos-123',
  },
  countries: [
    {
      id: '5e38df0b61f76a6bcf212518',
      name: 'American Samoa',
      hasAccess: false,
    },
    {
      id: '5e82eed461f76a274300022d',
      name: 'Australia',
      hasAccess: false,
    },
    {
      id: '5eba39e161f76a3da3000061',
      name: 'Cambodia',
      hasAccess: false,
    },
    {
      id: '5d3f884462165f31bf416c1e',
      name: 'Cook Islands',
      hasAccess: false,
    },
  ],
  isLoading: false,
  hasRequestCountryAccessCompleted: false,
  errorMessage: '',
};
RequestProjectAccess.argTypes = {
  onAttemptRequestProjectAccess: { action: 'submitted' },
  onBackToProjects: { action: 'back clicked' },
};

const SignupFormTemplate = args => (
  <MockOverlayDiv>
    <SignupFormComponent {...args} />
  </MockOverlayDiv>
);

export const SignupForm = SignupFormTemplate.bind({});
SignupForm.args = {
  isRequestingSignup: false,
};
SignupForm.argTypes = {
  onAttemptUserSignup: { action: 'submitted' },
};

const EmailVerificationTemplate = args => <EmailVerificationComponent {...args} />;

export const EmailVerification = EmailVerificationTemplate.bind({});
EmailVerification.args = {
  hasSentEmail: false,
  messageFailEmailVerify: '',
};
EmailVerification.argTypes = {
  onResendEmail: { action: 'submitted' },
};
