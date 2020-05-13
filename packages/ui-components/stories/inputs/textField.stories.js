/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useCallback } from 'react';
import { CalendarToday, KeyboardArrowDown, Visibility } from '@material-ui/icons';
import InputAdornment from '@material-ui/core/InputAdornment';
import styled from 'styled-components';
import { TextField } from '../../src';

export default {
  title: 'Inputs/TextField',
};

const Container = styled.div`
  max-width: 380px;
  padding: 2rem;
`;

export const textField = () => (
  <Container>
    <TextField name="simpleText" label="Simple text field" autoComplete="off" />
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
    <TextField name="email" label="Email" type="email" />
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

const FlexContainer = styled.div`
  display: flex;
  max-width: 750px;
  padding: 2rem;
`;

const FlexTextField = styled(TextField)`
  flex: 1;

  &:first-child {
    margin-right: 1rem;
  }

  &:last-child {
    margin-left: 1rem;
  }
`;

export const layout = () => (
  <FlexContainer>
    <FlexTextField name="field1" label="Field 1" />
    <FlexTextField name="field2" label="Field 2" />
  </FlexContainer>
);

export const controlled = () => {
  const [value, setValue] = useState('Foo');

  const handleChange = useCallback(
    event => {
      setValue(event.target.value);
    },
    [setValue],
  );

  return (
    <Container>
      <TextField name="controlled" label="Controlled" value={value} onChange={handleChange} />
    </Container>
  );
};
