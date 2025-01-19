import React from 'react';
import styled from 'styled-components';
import { useQueryClient } from '@tanstack/react-query';
import {
  FormGroup as MuiFormGroup,
  FormControlLabel as MuiFormControlLabel,
  Checkbox as MuiCheckbox,
} from '@material-ui/core';
import { getTaskFilterSetting, setTaskFilterSetting } from '../../../utils';
import { TaskFilterType } from '../../../types';
import { useTasksTable } from './TasksTable';

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
  margin-left: 0;
  .MuiFormControlLabel-label {
    font-size: 0.625rem;
    color: ${({ theme }) => theme.palette.text.secondary};
    padding-inline-end: 0.5rem;
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
  const { onChangePage } = useTasksTable();

  const onChange = (event: React.ChangeEvent<{ name: string; checked: boolean }>) => {
    const { name: taskFilterName, checked: value } = event.target;
    setTaskFilterSetting(taskFilterName as TaskFilterType, value);
    // reset the page to 0 when the filter changes
    onChangePage(0);
    // Clear the cache so that the task data is re-fetched
    queryClient.invalidateQueries(['tasks']);
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
      <FilterCheckbox name="show_completed_tasks" label="Show completed tasks" />
      <FilterCheckbox name="show_cancelled_tasks" label="Show cancelled tasks" />
    </FormGroup>
  </Container>
);
