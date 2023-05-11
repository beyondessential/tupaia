/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createFilterOptions } from '@material-ui/lab/Autocomplete';
import styled from 'styled-components';
import MuiChip from '@material-ui/core/Chip';
import { Autocomplete as UIAutocomplete } from '@tupaia/ui-components';
import debounce from 'lodash.debounce';

const Chip = styled(MuiChip)`
  &:first-child {
    margin-left: 6px;
  }
`;

export const Autocomplete = props => {
  const {
    value,
    label,
    options,
    getOptionSelected,
    getOptionLabel,
    isLoading,
    onChangeSelection,
    onChangeSearchTerm,
    placeholder,
    helperText,
    canCreateNewOptions,
    allowMultipleValues,
    optionLabelKey,
    muiProps,
  } = props;
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchUpdate = React.useCallback(
    debounce(newValue => {
      onChangeSearchTerm(newValue);
    }, 200),
    [],
  );

  const muiPropsForCreateNewOptions = canCreateNewOptions
    ? {
        filterOptions: (autocompleteOptions, params) => {
          const filter = createFilterOptions();
          const filtered = filter(autocompleteOptions, params);
          const { inputValue } = params;

          // Suggest the creation of a new value
          if (inputValue !== '') {
            if (optionLabelKey) {
              filtered.push({
                [optionLabelKey]: inputValue,
              });
            } else filtered.push(inputValue);
          }

          return filtered;
        },
        freeSolo: true,
        selectOnFocus: true,
        clearOnBlur: true,
        handleHomeEndKeys: true,
      }
    : {};

  const muiPropsForMultipleValues = allowMultipleValues
    ? {
        disableClearable: true,
        multiple: true,
        renderTags: (values, getTagProps) =>
          values.map((option, index) => (
            <Chip
              color="primary"
              label={optionLabelKey ? option[optionLabelKey] : option}
              {...getTagProps({ index })}
            />
          )),
      }
    : {};

  const extraMuiProps = {
    onOpen: () => {
      // We don't load the option values until we open the search for the first time
      onChangeSearchTerm(searchTerm || '');
    },
    ...muiPropsForCreateNewOptions,
    ...muiPropsForMultipleValues,
    ...muiProps,
  };

  return (
    <UIAutocomplete
      value={value}
      label={label}
      options={options}
      getOptionSelected={getOptionSelected}
      getOptionLabel={getOptionLabel}
      loading={isLoading}
      onChange={onChangeSelection}
      onInputChange={(event, newValue) => {
        setSearchTerm(newValue);
        debouncedSearchUpdate(newValue);
      }}
      inputValue={searchTerm}
      placeholder={placeholder}
      helperText={helperText}
      muiProps={extraMuiProps}
    />
  );
};

Autocomplete.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  value: PropTypes.any,
  label: PropTypes.string,
  options: PropTypes.array.isRequired,
  getOptionSelected: PropTypes.func.isRequired,
  getOptionLabel: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  onChangeSelection: PropTypes.func.isRequired,
  onChangeSearchTerm: PropTypes.func,
  searchTerm: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  canCreateNewOptions: PropTypes.bool,
  allowMultipleValues: PropTypes.bool,
  optionLabelKey: PropTypes.string,
  muiProps: PropTypes.object,
};

Autocomplete.defaultProps = {
  value: null,
  label: '',
  isLoading: false,
  searchTerm: '',
  placeholder: '',
  helperText: '',
  canCreateNewOptions: false,
  allowMultipleValues: false,
  muiProps: {},
  optionLabelKey: null,
  onChangeSearchTerm: () => {},
};
