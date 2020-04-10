/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { action } from '@storybook/addon-actions';
import { CalendarToday, KeyboardArrowDown, Visibility } from '@material-ui/icons';
import { TextField, CheckboxField } from '../components/Fields';
import InputAdornment from '@material-ui/core/InputAdornment';
import styled from 'styled-components';

export default {
  title: 'Fields',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

export const textField = () => (
  <Container>
    <TextField name="simpleText" label="Simple text field" autocomplete="off" />
    <TextField name="defaultValue" label="Default Value" defaultValue="Default Value" />
    <TextField name="required" label="Required field" required />
    <TextField name="disabled" label="Disabled" disabled />
    <TextField name="placeholder" label="Placeholder text" placeholder="Placeholder here" />
    <TextField name="noLabel" placeholder="No label" />
    <TextField
      name="readOnly"
      label="Read only"
      InputProps={{ readOnly: true }}
      defaultValue="Some saved content"
    />
    <TextField name="helperText" label="Helper text" helperText="Some important text" />
    <TextField name="errorState" label="Error state" error />
    <TextField name="errorMessage" label="Error message" error helperText="Incorrect entry" />
    <TextField name="number" label="Number" type="number" />
    <TextField name="email" type="email" label="Email" />
    <TextField name="password" label="Password" type="password" />
  </Container>
);

export const textArea = () => (
  <Container>
    <TextField name="textArea" label="TextArea" multiline rows="4" />
  </Container>
);

export const icons = () => (
  <Container>
    <TextField
      name="currency"
      label="Currency input"
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
      }}
    />
    <TextField
      name="weight"
      label="Weight input"
      helperText="Weight"
      InputProps={{
        startAdornment: <InputAdornment position="start">Kg</InputAdornment>,
      }}
    />
    <TextField
      name="password"
      label="Password"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Visibility />
          </InputAdornment>
        ),
      }}
    />
    <TextField
      name="passwordNoLabel"
      placeholder="Password"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Visibility />
          </InputAdornment>
        ),
      }}
    />
    <TextField
      name="date"
      label="Select date"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <CalendarToday />
          </InputAdornment>
        ),
      }}
    />
    <TextField
      name="down"
      label="Keyboard Down"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <KeyboardArrowDown />
          </InputAdornment>
        ),
      }}
    />
  </Container>
);

export const sizes = () => (
  <Container>
    <TextField name="standard" label="Standard size" />
    <TextField name="small" label="Small size" size="small" />
  </Container>
);

export const layout = () => (
  <Container>
    <TextField name="fullWidth" label="Full width" />
    <TextField name="inline" label="Inline" />
  </Container>
);

export const checkboxField = () => <CheckboxField />;
