/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import throttle from 'lodash.throttle';
import { useWatch } from 'react-hook-form';
import { Country, DatatrakWebSurveyUsersRequest } from '@tupaia/types';
import { Autocomplete } from '../../../components';
import { useSurveyUsers } from '../../../api';

type User = DatatrakWebSurveyUsersRequest.ResBody[0];

interface AssigneeInputProps {
  value: string | null;
  onChange: (value: User['id'] | null) => void;
  inputRef?: React.Ref<any>;
  selectedCountry?: Country | null;
}

export const AssigneeInput = ({
  value,
  onChange,
  inputRef,
  selectedCountry,
}: AssigneeInputProps) => {
  const [searchValue, setSearchValue] = useState('');
  const { surveyCode } = useWatch('surveyCode');

  const { data: users = [], isLoading } = useSurveyUsers(
    surveyCode,
    selectedCountry?.code,
    searchValue,
  );

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
    />
  );
};
