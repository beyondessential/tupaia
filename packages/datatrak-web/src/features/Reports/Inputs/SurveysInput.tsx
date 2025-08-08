import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useSurveysQuery } from '../../../api';
import { InputHelperText } from '../../../components';
import { ReportAutocomplete } from './ReportAutocomplete';
import { InputWrapper } from './InputWrapper';

export const SurveysInput = () => {
  const { errors } = useFormContext();
  const { data: surveys } = useSurveysQuery();

  return (
    <InputWrapper>
      <Controller
        name="surveys"
        rules={{ required: 'Required', validate: value => (value.length > 0 ? true : 'Required') }}
        render={({ ref, onChange, value }, { invalid }) => {
          return (
            <ReportAutocomplete
              label="Survey"
              error={invalid}
              id="surveys"
              options={surveys?.map(({ code, name }) => ({ value: code, label: name })) ?? []}
              name="surveys"
              required
              getOptionLabel={option => option.label}
              placeholder="Select survey..."
              getOptionSelected={(option, selected) => option.value === selected.value}
              onChange={(_, newValue) => {
                // the onChange function expected by react-hook-form and mui are different
                onChange(newValue);
              }}
              value={value || []}
              inputRef={ref}
              muiProps={{
                multiple: true,
              }}
              aria-describedby={invalid ? 'surveys-error-text' : undefined}
            />
          );
        }}
      />
      {errors.surveys && (
        <InputHelperText error id="surveys-error-text">
          {(errors.surveys as Error).message}
        </InputHelperText>
      )}
    </InputWrapper>
  );
};
