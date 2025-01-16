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
      ...user,
      label: user.name,
      value: user.id,
    })) ?? [];

  //If we programmatically set the value of the input, we need to update the search value
  useEffect(() => {
    // if the selection is the same as the search value, do not update the search value
    if (value?.name === searchValue) return;

    setSearchValue(value?.name ?? '');
  }, [JSON.stringify(value)]);

  return (
    <>
      <QuestionAutocomplete
        id={id}
        label={label ?? ''}
        name={name ?? ''}
        helperText={detailLabel ?? ''}
        required={required}
        options={options}
        value={value}
        onChange={(_e, newSelectedOption) => onChange(newSelectedOption ?? null)}
        onInputChange={throttle((e, newValue) => {
          if (newValue === searchValue || !e || !e.target) return;
          setSearchValue(newValue);
        }, 200)}
        inputValue={searchValue}
        inputRef={ref}
        error={isError || invalid}
        getOptionLabel={option => option.label}
        loading={isLoading || !isFetched}
        getOptionSelected={(option, selected) => option.value === selected?.value}
      />
      {error && <InputHelperText error>{(error as Error).message}</InputHelperText>}
    </>
  );
};
