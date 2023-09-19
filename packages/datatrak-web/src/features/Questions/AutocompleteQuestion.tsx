/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { SurveyQuestionInputProps } from '../../types';
import { useAutocompleteOptions } from '../../api/queries';
import { Autocomplete as BaseAutocomplete } from '@tupaia/ui-components';
import { Paper } from '@material-ui/core';

const Autocomplete = styled(BaseAutocomplete)`
  width: 100%;
  max-width: 25rem;
  .MuiFormLabel-root {
    color: ${({ theme }) => theme.palette.text.primary};
  }
  .MuiOutlinedInput-notchedOutline {
    border: none;
  }

  .MuiInputBase-root {
    border-bottom: 1px solid ${({ theme }) => theme.palette.text.primary};
    border-radius: 0;
    &.Mui-focused {
      border-bottom-color: ${({ theme }) => theme.palette.primary.main};
    }
  }

  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    box-shadow: none;
    border: none;
  }
  .MuiInputBase-input.MuiAutocomplete-input.MuiInputBase-inputAdornedEnd {
    padding: 0.6rem 0.25rem;
  }
`;

const StyledPaper = styled(Paper).attrs({
  variant: 'outlined',
})`
  border-color: ${({ theme }) => theme.palette.primary.main};
`;

export const AutocompleteQuestion = ({
  id,
  label,
  name,
  optionSetId,
  controllerProps: { value, onChange, ref },
}: SurveyQuestionInputProps) => {
  const { data, isLoading, isError, error, isFetched } = useAutocompleteOptions(optionSetId);

  return (
    <Autocomplete
      id={id}
      label={label}
      name={name!}
      value={value}
      onChange={onChange}
      inputRef={ref}
      options={data?.map(option => option.value) || []}
      getOptionSelected={(option, value) => option === value}
      loading={isLoading || !isFetched}
      error={isError}
      helperText={error ? error.message : ''}
      placeholder="Search..."
      muiProps={{
        PaperComponent: StyledPaper,
      }}
    />
  );
};
