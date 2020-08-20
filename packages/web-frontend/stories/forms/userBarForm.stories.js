/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { ChangePasswordFormComponent } from '../../src/containers/ChangePasswordForm/ChangePasswordFormComponent';
import { RequestCountryAccessFormComponent } from '../../src/containers/RequestCountryAccessForm/RequestCountryAccessFormComponent';
import { DARK_BLUE, ERROR, FORM_BLUE } from '../../src/styles';
import { Form } from '../../src/containers/Form';

const MockUserBar = styled.div`
  margin: 1rem auto;
  max-width: 500px;
  padding: 1rem 1rem 1.5rem;
  background: white;

  // theme. Todo: refactor to be re-usable
  p,
  a,
  label,
  .MuiFormLabel-root,
  .MuiCheckbox-root,
  .MuiInput-underline::before {
    color: black;
    border-color: black;
  }

  .MuiInput-underline:hover:not(.Mui-disabled):before {
    border-bottom: 2px solid black;
  }

  p {
    padding: 18px;
  }

  .Mui-error {
    color: ${ERROR};
  }

  .Mui-focused {
    color: ${FORM_BLUE};
  }

  .MuiInputBase-input {
    color: ${DARK_BLUE};
  }

  button.MuiButtonBase-root {
    margin-top: 20px;
  }
`;

export default {
  title: 'Form/UserBarForms',
  component: Form,
  parameters: { actions: { argTypesRegex: '^onAttempt*' } },
  decorators: [
    Story => (
      <MockUserBar>
        <Story />
      </MockUserBar>
    ),
  ],
};

const ChangePasswordFormTemplate = args => <ChangePasswordFormComponent {...args} />;

export const ChangePasswordForm = ChangePasswordFormTemplate.bind({});
ChangePasswordForm.argTypes = { onAttemptChangePassword: { action: 'clicked' } };
ChangePasswordForm.args = {
  isRequestingChangePassword: false,
  changePasswordFailedMessage: '',
  hasChangePasswordCompleted: false,
};
ChangePasswordForm.argTypes = {
  onAttemptChangePassword: { action: 'submitted' },
  onClose: { action: 'closed' },
};

const RequestCountryAccessFormTemplate = args => <RequestCountryAccessFormComponent {...args} />;

export const RequestCountryAccessForm = RequestCountryAccessFormTemplate.bind({});
RequestCountryAccessForm.args = {
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
  isFetchingCountryAccessData: false,
  isRequestingCountryAccess: false,
  hasRequestCountryAccessCompleted: false,
  errorMessage: '',
};
RequestCountryAccessForm.argTypes = {
  onAttemptRequestCountryAccess: { action: 'submitted' },
  onClose: { action: 'closed' },
};
