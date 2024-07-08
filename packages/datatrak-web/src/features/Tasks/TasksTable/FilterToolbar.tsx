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
import {
  FilterType,
  getTaskFilterSetting,
  setTaskFilterSetting,
} from '../utils/taskFilterSettings';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0.1rem 0 0;
  border-bottom: 1px solid ${({ theme }) => theme.palette.divider};
`;

const FormGroup = styled(MuiFormGroup)`
  display: flex;
  flex-direction: row;
`;

const FormControlLabel = styled(MuiFormControlLabel)`
  .MuiFormControlLabel-label {
    font-size: 0.625rem;
    color: ${({ theme }) => theme.palette.text.secondary};
    padding-right: 0.8rem;
  }

  .MuiButtonBase-root {
    padding: 0.4rem;
  }

  .MuiSvgIcon-root {
    font-size: 1.1rem;
  }
`;

const FilterCheckbox = ({ name, label }) => {
  const queryClient = useQueryClient();

  const onChange = (event: React.ChangeEvent<{ name: string; checked: boolean }>) => {
    const { name, checked: value } = event.target;
    setTaskFilterSetting(name as FilterType, value);
    // Clear the cache so that the task data is re-fetched
    queryClient.invalidateQueries('tasks');
  };

  return (
    <FormControlLabel
      control={
        <MuiCheckbox
          checked={getTaskFilterSetting(name)}
          onChange={onChange}
          name={name}
          color="primary"
          size="small"
        />
      }
      label={label}
    />
  );
};

export const FilterToolbar = () => (
  <Container>
    <FormGroup>
      <FilterCheckbox name="all_assignees_tasks" label="Show all assignees" />
      <FilterCheckbox name="all_completed_tasks" label="Show completed tasks" />
      <FilterCheckbox name="all_cancelled_tasks" label="Show cancelled tasks" />
    </FormGroup>
  </Container>
);
