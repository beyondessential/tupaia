/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useSurveys } from '../../../api';
import { Autocomplete } from './Autocomplete';
import { InputWrapper } from './InputWrapper';
import { InputHelperText } from '../../../components';

export const SurveysInput = () => {
  const { errors } = useFormContext();
  const { data: surveys } = useSurveys();

  return (
    <InputWrapper>
      <Controller
        name="surveys"
        rules={{ required: 'Required', validate: value => (value.length > 0 ? true : 'Required') }}
        render={({ ref, onChange, value }, { invalid }) => {
          return (
            <Autocomplete
              label="Survey"
              error={invalid}
              options={surveys?.map(({ code, name }) => ({ value: code, label: name })) ?? []}
              name="surveys"
              required
              getOptionLabel={option => option.label}
              placeholder="Select survey..."
              onChange={(_, newValue) => {
                // the onChange function expected by react-hook-form and mui are different
                onChange(newValue);
              }}
              value={value || []}
              inputRef={ref}
              muiProps={{
                multiple: true,
              }}
            />
          );
        }}
      />
      {errors.surveys && (
        <InputHelperText error>{(errors.surveys as Error).message}</InputHelperText>
      )}
    </InputWrapper>
  );
};
