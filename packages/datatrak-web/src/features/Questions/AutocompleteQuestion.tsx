/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { Autocomplete as BaseAutocomplete } from '@tupaia/ui-components';
import { SurveyQuestionInputProps } from '../../types';
import { useAutocompleteOptions } from '../../api/queries';

const Autocomplete = styled(BaseAutocomplete)`
  width: 100%;
  max-width: 25rem;

  fieldset:disabled & {
    .MuiAutocomplete-clearIndicator {
      display: none; // hide the clear button when disabled on review screen
    }
  }

  .MuiFormLabel-root {
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 1rem;
    line-height: 1.5;
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
    font-size: 0.875rem;
  }

  .MuiAutocomplete-inputRoot .MuiAutocomplete-endAdornment {
    right: 0;
  }
  .MuiIconButton-root {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

const StyledPaper = styled(Paper).attrs({
  variant: 'outlined',
})`
  border-color: ${({ theme }) => theme.palette.primary.main};
  .MuiAutocomplete-option {
    &:hover,
    &[data-focus='true'] {
      background-color: ${({ theme }) => theme.palette.primary.main}55;
    }
  }
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
      onChange={(_e, value) => onChange(value)}
      inputRef={ref}
      options={data?.map(option => option.value) || []}
      getOptionSelected={(option, value) => option === value}
      loading={isLoading || !isFetched}
      error={isError}
      helperText={error ? (error as Error).message : ''}
      placeholder="Search..."
      muiProps={{
        PaperComponent: StyledPaper,
      }}
    />
  );
};
