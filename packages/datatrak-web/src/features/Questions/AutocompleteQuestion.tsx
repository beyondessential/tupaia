/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Paper } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { Autocomplete as BaseAutocomplete } from '@tupaia/ui-components';
import { Option } from '@tupaia/types';
import { SurveyQuestionInputProps } from '../../types';
import { useAutocompleteOptions } from '../../api';
import { MOBILE_BREAKPOINT } from '../../constants';
import { QuestionHelperText } from './QuestionHelperText';

const Autocomplete = styled(BaseAutocomplete)`
  width: calc(100% - 3.5rem);
  max-width: 25rem;

  .MuiFormControl-root {
    margin-bottom: 0;
  }
  fieldset:disabled & {
    .MuiAutocomplete-clearIndicator {
      display: none; // hide the clear button when disabled on review screen
    }
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
    box-shadow: none;
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

const StyledPaper = styled(Paper).attrs({
  variant: 'outlined',
})`
  border-color: ${({ theme }) => theme.palette.primary.main};
  .MuiAutocomplete-option {
    padding: 0;
    &:hover,
    &[data-focus='true'] {
      background-color: ${({ theme }) => theme.palette.primaryHover};
    }
    &[aria-selected='true'] {
      background-color: transparent;
    }
    &[aria-disabled='true'] {
      opacity: 1;
    }
  }
`;

const OptionWrapper = styled.div`
  width: 100%;
  padding: 0.2rem 0.875rem;
  line-height: 1.2;
  margin: 0.3rem 0;
`;

const SelectedOption = styled(OptionWrapper)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 0.425rem;
  padding-right: 0.425rem;
  margin-left: 0.45rem;
  margin-right: 0.45rem;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.palette.primary.main};
  .MuiSvgIcon-root {
    font-size: 1.2rem;
  }
`;

const DisplayOption = ({ option, state }) => {
  const { selected } = state;
  const label = typeof option === 'string' ? option : option.label || option.value;

  if (selected)
    return (
      <SelectedOption>
        {label}
        <Check color="primary" />
      </SelectedOption>
    );
  return <OptionWrapper>{label}</OptionWrapper>;
};

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
    // add an 'add' option to the list of options
    return [
      ...options,
      {
        label: `Add "${inputValue}"`,
        value: inputValue,
      },
    ];
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

  return (
    <>
      <Autocomplete
        id={id}
        label={label!}
        name={name!}
        value={selectedValue?.value || null}
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
            component: QuestionHelperText,
          },
        }}
        placeholder="Search..."
        muiProps={{
          PaperComponent: StyledPaper,
          freeSolo: !!createNew,
          getOptionDisabled: option => getOptionSelected(option, selectedValue?.value),
          renderOption: (option, state) => <DisplayOption option={option} state={state} />,
        }}
      />
      {error && <QuestionHelperText error>{(error as Error).message}</QuestionHelperText>}
    </>
  );
};
