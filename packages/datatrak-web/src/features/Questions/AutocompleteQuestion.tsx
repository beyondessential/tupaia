/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { createFilterOptions } from '@material-ui/lab';
import { Option } from '@tupaia/types';
import { SurveyQuestionInputProps } from '../../types';
import { useAutocompleteOptions } from '../../api';
import { MOBILE_BREAKPOINT } from '../../constants';
import { Autocomplete as BaseAutocomplete, InputHelperText } from '../../components';

const Autocomplete = styled(BaseAutocomplete)`
  width: calc(100% - 3.5rem);
  max-width: 25rem;

  .MuiFormControl-root {
    margin-bottom: 0;
  }

  .MuiFormLabel-root {
    color: ${({ theme }) => theme.palette.text.primary};
    font-size: 0.875rem;
    line-height: 1.2;
    @media (min-width: ${MOBILE_BREAKPOINT}) {
      font-size: 1rem;
    }
  }
  .MuiOutlinedInput-notchedOutline {
    border: none;
  }

  .MuiInputBase-root {
    border-bottom: 1px solid ${({ theme }) => theme.palette.text.primary};
    border-radius: 0;
    order: 2; // make the helper text appear above the input
    &.Mui-focused {
      border-bottom-color: ${({ theme }) => theme.palette.primary.main};
    }
  }

  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border: none;
  }
  .MuiInputBase-input.MuiAutocomplete-input.MuiInputBase-inputAdornedEnd {
    padding: 0.6rem 0;
    font-size: 0.875rem;
  }

  .MuiAutocomplete-inputRoot .MuiAutocomplete-endAdornment {
    right: 0;
  }
  .MuiIconButton-root {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

export const AutocompleteQuestion = ({
  id,
  label,
  name,
  optionSetId,
  detailLabel,
  config = {},
  controllerProps: { value: selectedValue = null, onChange, ref, invalid },
}: SurveyQuestionInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const { autocomplete = {} } = config!;
  const { attributes, createNew } = autocomplete;
  const { data, isLoading, isError, error, isFetched } = useAutocompleteOptions(
    optionSetId,
    attributes,
  );

  const getOptionSelected = (option: Option, selectedOption?: string | null) => {
    const value = typeof option === 'string' ? option : option?.value;
    return value === selectedOption;
  };

  const getOptions = () => {
    const options = data || [];
    // If we can't create a new option, or there is no input value, or the input value is already in the options, or the value is already added, return the options as they are
    if (!createNew || !inputValue || options.find(option => option.value === inputValue))
      return options;
    // if we have selected a newly created option, add it to the list of options
    if (selectedValue?.value === inputValue)
      return [
        ...options,
        {
          label: inputValue,
          value: inputValue,
        },
      ];
    return options;
  };

  const options = getOptions().sort((a, b) => {
    const aLabel = a.label || a.value;
    const bLabel = b.label || b.value;
    return aLabel.localeCompare(bLabel);
  });

  const handleSelectOption = (option: Option) => {
    if (!option) return onChange(null);
    const { value } = option;
    // if the option is not in the list of options, it is a new option
    if (!data?.find(o => o.value === value)) {
      onChange({
        value,
        label: value,
        isNew: true,
        optionSetId,
      });
    } else {
      onChange(option);
    }
  };

  const filter = createFilterOptions({
    matchFrom: 'start',
  });

  return (
    <>
      <Autocomplete
        id={id}
        label={label!}
        name={name!}
        value={selectedValue?.value || selectedValue || null}
        onChange={(_e, newSelectedOption) => handleSelectOption(newSelectedOption)}
        onInputChange={(_e, value) => setInputValue(value)}
        inputValue={inputValue}
        inputRef={ref}
        options={options}
        getOptionLabel={option =>
          typeof option === 'string' ? option : option.label || option.value
        }
        getOptionSelected={getOptionSelected}
        loading={isLoading || !isFetched}
        error={isError || invalid}
        helperText={detailLabel as string}
        textFieldProps={{
          FormHelperTextProps: {
            component: InputHelperText,
          },
        }}
        placeholder="Search..."
        muiProps={{
          freeSolo: !!createNew,
          getOptionDisabled: option => getOptionSelected(option, selectedValue?.value),
          filterOptions: (availableOptions, params) => {
            const filtered = filter(availableOptions, params);

            // Suggest the creation of a new value
            if (params.inputValue !== '' && createNew) {
              filtered.push({
                value: params.inputValue,
                label: `Add "${params.inputValue}"`,
              });
            }

            return filtered;
          },
        }}
      />
      {error && <InputHelperText error>{(error as Error).message}</InputHelperText>}
    </>
  );
};
