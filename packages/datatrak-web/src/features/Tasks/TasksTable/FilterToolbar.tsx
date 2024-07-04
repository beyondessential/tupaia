/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { useQueryClient } from 'react-query';
import {
  FormGroup as MuiFormGroup,
  FormControlLabel as MuiFormControlLabel,
  Checkbox as MuiCheckbox,
} from '@material-ui/core';
import { getTaskFilterSetting, setTaskFilterSetting } from '../utils/taskFilterSettings.ts';

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
  const queryClient = useQueryClient();

  const handleChange = event => {
    const { name, checked: value } = event.target;
    setTaskFilterSetting(name, value);
    queryClient.invalidateQueries('tasks');
  };

  return (
    <Container>
      <FormGroup>
        <Checkbox
          name="all_assignees"
          label="Show all assignees"
          value={getTaskFilterSetting('all_assignees')}
          onChange={handleChange}
        />
        <Checkbox
          name="all_completed"
          label="Show completed tasks"
          value={getTaskFilterSetting('all_completed')}
          onChange={handleChange}
        />
        <Checkbox
          name="all_cancelled"
          label="Show cancelled tasks"
          value={getTaskFilterSetting('all_cancelled')}
          onChange={handleChange}
        />
      </FormGroup>
    </Container>
  );
};
