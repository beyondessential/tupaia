/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import throttle from 'lodash.throttle';
import { Country, DatatrakWebUsersRequest } from '@tupaia/types';
import { Autocomplete } from '../../components';
import { useSurveyUsers } from '../../api';
import { Survey } from '../../types';

type User = DatatrakWebUsersRequest.ResBody[0];

interface AssigneeInputProps {
  value: User | null;
  onChange: (value: User | null) => void;
  inputRef?: React.Ref<any>;
  countryCode?: Country['code'];
  surveyCode?: Survey['code'];
  required?: boolean;
  name?: string;
  error?: boolean;
  disabled?: boolean;
}

export const AssigneeInput = ({
  value: selectedValue,
  onChange,
  inputRef,
  countryCode,
  surveyCode,
  required,
  error,
  disabled,
}: AssigneeInputProps) => {
  const [searchValue, setSearchValue] = useState('');

  const { data: users = [], isLoading } = useSurveyUsers(surveyCode, countryCode, searchValue);

  const onChangeAssignee = (_e, newSelection: User | null) => {
    onChange(newSelection ?? null);
  };

  const options =
    users?.map(user => ({
      ...user,
      value: user.id,
      label: user.name,
    })) ?? [];

  //If we programmatically set the value of the input, we need to update the search value
  useEffect(() => {
    // if the selection is the same as the search value, do not update the search value
    if (selectedValue?.name === searchValue || isLoading) return;

    setSearchValue(selectedValue?.name ?? '');
  }, [JSON.stringify(selectedValue)]);

  return (
    <Autocomplete
      label="Assignee"
      options={options}
      value={selectedValue}
      onChange={onChangeAssignee}
      inputRef={inputRef}
      name="assignee"
      onInputChange={throttle((e, newValue) => {
        if (!e) return;
        setSearchValue(newValue);
      }, 100)}
      inputValue={selectedValue?.name ?? searchValue}
      getOptionLabel={option => option.label}
      getOptionSelected={(option, selected) => option.id === selected?.id}
      placeholder="Search..."
      loading={isLoading}
      required={required}
      error={error}
      disabled={disabled}
    />
  );
};