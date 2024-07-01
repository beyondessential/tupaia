/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import {
  FormGroup as MuiFormGroup,
  FormControlLabel as MuiFormControlLabel,
  Checkbox as MuiCheckbox,
} from '@material-ui/core';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.3rem 0.3rem 0.2rem;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const FormGroup = styled(MuiFormGroup)`
  display: flex;
  flex-direction: row;
`;

const FormControlLabel = styled(MuiFormControlLabel)`
  .MuiFormControlLabel-label {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.palette.text.secondary};
  }

  .MuiCheckbox-root {
    padding-right: 3px;
  }
`;

const Checkbox = ({ name, value, label, onChange }) => {
  return (
    <FormControlLabel
      control={
        <MuiCheckbox checked={value} onChange={onChange} name={name} color="primary" size="small" />
      }
      label={label}
    />
  );
};

export const FilterToolbar = () => {
  const [state, setState] = React.useState({
    allAssignees: true,
    allCompleted: false,
    allCancelled: false,
  });

  const handleChange = event => {
    setState({ ...state, [event.target.name]: event.target.checked });
  };

  const { allAssignees, allCompleted, allCancelled } = state;

  return (
    <Container>
      <FormGroup>
        <Checkbox
          name="allAssignees"
          label="Show all assignees"
          value={allAssignees}
          handleChange={handleChange}
        />
        <Checkbox
          name="allCompleted"
          label="Show completed tasks"
          value={allCompleted}
          handleChange={handleChange}
        />
        <Checkbox
          name="allCancelled"
          label="Show cancelled tasks"
          value={allCancelled}
          handleChange={handleChange}
        />
      </FormGroup>
    </Container>
  );
};
