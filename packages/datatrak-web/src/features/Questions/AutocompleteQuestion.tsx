/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import throttle from 'lodash.throttle';
import { createFilterOptions } from '@material-ui/lab';
import { Option } from '@tupaia/types';
import { SurveyQuestionInputProps } from '../../types';
import { useAutocompleteOptions } from '../../api';
import { InputHelperText, QuestionAutocomplete } from '../../components';

export const AutocompleteQuestion = ({
  id,
  label,
  name,
  optionSetId,
  detailLabel,
  required,
  config = {},
  controllerProps: { value: selectedValue = null, onChange, ref, invalid },
}: SurveyQuestionInputProps) => {
  const [searchValue, setSearchValue] = useState('');
  const { autocomplete = {} } = config!;
  const { attributes, createNew } = autocomplete;
  const { data, isLoading, isError, error, isFetched } = useAutocompleteOptions(
    optionSetId,
    attributes,
    searchValue,
  );

  const getOptionSelected = (option: Option, selectedOption?: string | null) => {
    const value = typeof option === 'string' ? option : option?.value;
    return value === selectedOption;
  };

  const getOptions = () => {
    const options = data || [];
    // If we can't create a new option, or there is no input value, or the input value is already in the options, or the value is already added, return the options as they are
    if (!createNew || !searchValue || options.find(option => option.value === searchValue))
      return options;
    // if we have selected a newly created option, add it to the list of options
    if (selectedValue?.value === searchValue)
      return [
        ...options,
        {
          label: searchValue,
          value: searchValue,
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
      onChange(value);
    } else {
      onChange(option.value);
    }
  };

  const filter = createFilterOptions({
    matchFrom: 'start',
  });

  return (
    <>
      <QuestionAutocomplete
        id={id}
        label={label!}
        name={name!}
        value={selectedValue?.value || selectedValue || null}
        required={required}
        onChange={(_e, newSelectedOption) => handleSelectOption(newSelectedOption)}
        onInputChange={throttle((_, newValue) => {
          setSearchValue(newValue);
        }, 200)}
        inputValue={searchValue}
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
