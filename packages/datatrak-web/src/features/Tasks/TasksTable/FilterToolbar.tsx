/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import keyBy from 'lodash.keyby';
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

const customFilters = {
  allAssignees: (value, filters) => {
    console.log('filter allAssignees', value);
    return filters;
  },
  allCompleted: (value, filters) => {
    return value ? { ...filters, task_status: { id: 'task_status', value: 'to_do' } } : filters;
  },
  allCancelled: (value, filters) => {
    return value ? { ...filters, task_status: { id: 'task_status', value: 'to_do' } } : filters;
  },
};

export const FilterToolbar = ({ onChangeFilters, filters }) => {
  const filtersById = keyBy(filters, 'id');
  console.log('filters', filters, filtersById);
  const handleChange = event => {
    const { name: id, checked: value } = event.target;
    const customFilter = customFilters[id];
    const updatedFilters = customFilter(value, filters);
    console.log('updatedFilters', updatedFilters);
    console.log('as array', Object.values(updatedFilters));

    const foo = [
      {
        id: 'task_status',
        value: {
          comparisonValue: 'completed',
          comparator: '!=',
        },
      },
    ];
    onChangeFilters(foo);
  };

  const getValue = id => filtersById[id]?.value || false;

  return (
    <Container>
      <FormGroup>
        <Checkbox
          name="allAssignees"
          label="Show all assignees"
          value={getValue('allAssignees')}
          onChange={handleChange}
        />
        <Checkbox
          name="allCompleted"
          label="Show completed tasks"
          value={getValue('allCompleted')}
          onChange={handleChange}
        />
        <Checkbox
          name="allCancelled"
          label="Show cancelled tasks"
          value={getValue('allCancelled')}
          onChange={handleChange}
        />
      </FormGroup>
    </Container>
  );
};
