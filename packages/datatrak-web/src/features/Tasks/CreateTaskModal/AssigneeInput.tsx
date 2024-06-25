/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import throttle from 'lodash.throttle';
import { useWatch } from 'react-hook-form';
import { DatatrakWebSurveyUsersRequest } from '@tupaia/types';
import { Autocomplete } from '../../../components';
import { useSurveyUsers } from '../../../api';

type User = DatatrakWebSurveyUsersRequest.ResBody[0];

interface AssigneeInputProps {
  value: string | null;
  onChange: (value: User | null) => void;
  inputRef?: React.Ref<any>;
}

export const AssigneeInput = ({ value, onChange, inputRef }: AssigneeInputProps) => {
  const [searchValue, setSearchValue] = useState('');
  const { surveyCode } = useWatch('surveyCode');

  const { data: users = [] } = useSurveyUsers(surveyCode, searchValue);

  const onChangeAssignee = (_e, newSelection: User | null) => {
    onChange(newSelection);
  };

  const options =
    users?.map(user => ({
      ...user,
      value: user.id,
      label: user.name,
    })) ?? [];

  return (
    <Autocomplete
      label="Assignee"
      options={options}
      value={value}
      onChange={onChangeAssignee}
      inputRef={inputRef}
      name="assignee"
      onInputChange={throttle((_, newValue) => {
        setSearchValue(newValue);
      }, 200)}
      inputValue={searchValue}
      getOptionLabel={option => option.name}
      getOptionSelected={(option, selectedOption) => option.id === selectedOption?.id}
      placeholder="Search..."
    />
  );
};
