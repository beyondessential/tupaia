import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import throttle from 'lodash.throttle';
import { createFilterOptions } from '@material-ui/lab';
import { Option } from '@tupaia/types';
import { SurveyQuestionInputProps } from '../../types';
import { useAutocompleteOptions } from '../../api';
import { DESKTOP_BREAKPOINT } from '../../constants';
import { Autocomplete as BaseAutocomplete, InputHelperText } from '../../components';

const Autocomplete = styled(BaseAutocomplete)`
  width: calc(100% - 3.5rem);
  max-width: 25rem;

  .MuiFormControl-root {
    margin-bottom: 0;
  }

  .MuiFormLabel-root {
    font-size: 0.875rem;
    line-height: 1.2;
    @media (min-width: ${DESKTOP_BREAKPOINT}) {
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
  required,
  config = {},
  controllerProps: { value: selectedValue = null, onChange, ref, invalid },
}: SurveyQuestionInputProps) => {
  const [searchValue, setSearchValue] = useState(selectedValue?.value || selectedValue || '');
  const { autocomplete = {} } = config!;
  const { attributes, createNew } = autocomplete;
  const { data, isLoading, isError, error, isFetched } = useAutocompleteOptions(
    optionSetId,
    attributes,
    searchValue,
  );

  //If we programmatically set the value of the input, we need to update the search value
  useEffect(() => {
    // if the selection is the same as the search value, do not update the search value
    if (!selectedValue || typeof selectedValue !== 'string' || selectedValue === searchValue)
      return;

    setSearchValue(selectedValue);
  }, [JSON.stringify(selectedValue)]);

  const canCreateNew = !!createNew;

  const getOptionSelected = (option: Option, selectedOption?: string | null) => {
    const value = typeof option === 'string' ? option : option?.value;
    return value === selectedOption;
  };

  const getOptions = () => {
    const options = data || [];
    // If we can't create a new option, or there is no input value, or the input value is already in the options, or the value is already added, return the options as they are
    if (!canCreateNew || !searchValue || options.find(option => option.value === searchValue))
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
      <Autocomplete
        id={id}
        label={label!}
        name={name!}
        value={selectedValue?.value || selectedValue || null}
        required={required}
        onChange={(_e, newSelectedOption) => handleSelectOption(newSelectedOption)}
        onInputChange={throttle((e, newValue) => {
          if (newValue === searchValue || !e || !e.target) return;
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
