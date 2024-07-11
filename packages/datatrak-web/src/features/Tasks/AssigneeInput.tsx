/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import throttle from 'lodash.throttle';
import styled from 'styled-components';
import { Country, DatatrakWebSurveyUsersRequest } from '@tupaia/types';
import { Autocomplete as BaseAutocomplete } from '../../components';
import { useSurveyUsers } from '../../api';
import { Survey } from '../../types';

const Autocomplete = styled(BaseAutocomplete)`
  .MuiFormLabel-root {
    font-size: inherit;
    font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  }
  .MuiInputBase-root {
    font-size: 0.875rem;
  }
  input::placeholder {
    color: ${({ theme }) => theme.palette.text.secondary};
  }
  .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.divider};
  }
  .MuiInputLabel-asterisk {
    color: ${({ theme }) => theme.palette.error.main};
  }
`;

type User = DatatrakWebSurveyUsersRequest.ResBody[0];

interface AssigneeInputProps {
  value: string | null;
  onChange: (value: User['id'] | null) => void;
  inputRef?: React.Ref<any>;
  countryCode?: Country['code'];
  surveyCode?: Survey['code'];
  required?: boolean;
  name?: string;
  error?: boolean;
}

export const AssigneeInput = ({
  value,
  onChange,
  inputRef,
  countryCode,
  surveyCode,
  required,
  error,
}: AssigneeInputProps) => {
  const [searchValue, setSearchValue] = useState('');

  const { data: users = [], isLoading } = useSurveyUsers(surveyCode, countryCode, searchValue);

  const onChangeAssignee = (_e, newSelection: User | null) => {
    onChange(newSelection?.id ?? null);
  };

  const options =
    users?.map(user => ({
      ...user,
      value: user.id,
      label: user.name,
    })) ?? [];

  const selection = options.find(option => option.id === value);

  return (
    <Autocomplete
      label="Assignee"
      options={options}
      value={selection}
      onChange={onChangeAssignee}
      inputRef={inputRef}
      name="assignee"
      onInputChange={throttle((_, newValue) => {
        setSearchValue(newValue);
      }, 200)}
      inputValue={searchValue}
      getOptionLabel={option => option.label}
      getOptionSelected={option => option.id === value}
      placeholder="Search..."
      loading={isLoading}
      required={required}
      error={error}
    />
  );
};
