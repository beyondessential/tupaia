/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import throttle from 'lodash.throttle';
import { SurveyQuestionInputProps } from '../../types';
import { usePermissionGroupUsers } from '../../api';
import { useSurveyForm } from '../Survey';
import { InputHelperText, QuestionAutocomplete } from '../../components';

export const UserQuestion = ({
  id,
  label,
  detailLabel,
  name,
  required,
  controllerProps: { onChange, value, ref, invalid },
  config,
}: SurveyQuestionInputProps) => {
  const [searchValue, setSearchValue] = useState('');
  const { countryCode } = useSurveyForm();
  const {
    data: users,
    isLoading,
    isFetched,
    isError,
    error,
  } = usePermissionGroupUsers(countryCode, config?.user?.permissionGroup, searchValue);

  const options =
    users?.map(user => ({
      label: user.name,
      value: user.id,
    })) ?? [];

  const selectedValue = options.find(option => option.value === value);

  useEffect(() => {
    if (selectedValue && !searchValue) {
      setSearchValue(selectedValue.label);
    }
  }, [selectedValue?.value]);

  return (
    <>
      <QuestionAutocomplete
        id={id}
        label={label ?? ''}
        name={name ?? ''}
        helperText={detailLabel ?? ''}
        required={required}
        options={options}
        value={selectedValue}
        onChange={(_e, newSelectedOption) => onChange(newSelectedOption?.value ?? null)}
        onInputChange={throttle((_, newValue) => {
          if (newValue === searchValue) return;
          setSearchValue(newValue);
        }, 200)}
        inputValue={searchValue}
        inputRef={ref}
        error={isError || invalid}
        getOptionLabel={option => option.label}
        loading={isLoading || !isFetched}
        getOptionSelected={option => option.value === value}
      />
      {error && <InputHelperText error>{(error as Error).message}</InputHelperText>}
    </>
  );
};
