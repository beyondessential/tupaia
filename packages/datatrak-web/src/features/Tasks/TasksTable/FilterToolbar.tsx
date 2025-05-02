import {
  Checkbox as MuiCheckbox,
  CheckboxProps as MuiCheckboxProps,
  FormControlLabel as MuiFormControlLabel,
  FormGroup as MuiFormGroup,
} from '@material-ui/core';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import styled from 'styled-components';
import { TaskFilterType } from '../../../types';
import { getTaskFilterSetting, setTaskFilterSetting } from '../../../utils';
import { useTasksTable } from './TasksTable';
import { useResetTasksTableFiltersOnUnmount } from './useResetTasksTableFiltersOnUnmount';

const Container = styled.div`
  align-items: center;
  border-bottom: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
  display: flex;
  justify-content: flex-end;
  padding-block: 0.125rem;
`;

const FormGroup = styled(MuiFormGroup)`
  display: flex;
  flex-direction: row;
`;

const FormControlLabel = styled(MuiFormControlLabel)`
  margin-inline-start: 0;
  .MuiFormControlLabel-label {
    color: ${props => props.theme.palette.text.secondary};
    font-size: 0.75rem;
    letter-spacing: 0.02em;
    padding-inline-end: 0.5rem;
  }

  .MuiButtonBase-root {
    padding: 0.4rem;
  }

  .MuiSvgIcon-root {
    font-size: 1.1rem;
  }
`;

const FilterCheckbox = ({ name, label }: { name: TaskFilterType; label: React.ReactNode }) => {
  const queryClient = useQueryClient();
  const { onChangePage } = useTasksTable();

  const onChange: MuiCheckboxProps['onChange'] = event => {
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

export const FilterToolbar = () => {
  useResetTasksTableFiltersOnUnmount();
  return (
    <Container>
      <FormGroup>
        <FilterCheckbox name="all_assignees_tasks" label="Show all assignees" />
        <FilterCheckbox name="show_completed_tasks" label="Show completed tasks" />
        <FilterCheckbox name="show_cancelled_tasks" label="Show cancelled tasks" />
      </FormGroup>
    </Container>
  );
};
