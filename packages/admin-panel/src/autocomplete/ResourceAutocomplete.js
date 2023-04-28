/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete } from './Autocomplete';
import { useSearchResults } from './useSearchResults';
import { useGetInitialOptions } from './useGetInitialOptions';

export const ResourceAutocomplete = ({
  placeholder,
  initialValue,
  label,
  helperText,
  endpoint,
  optionLabelKey,
  optionValueKey,
  onChange,
  canCreateNewOptions,
  allowMultipleValues,
  parentRecord,
  baseFilter,
  pageSize,
}) => {
  // eslint-disable-next-line no-nested-ternary
  const initialValueAsArray = initialValue
    ? Array.isArray(initialValue)
      ? initialValue
      : [initialValue]
    : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [selection, setSelection] = useState([]);

  const { data: searchResults = [], isFetching: isSearching } = useSearchResults({
    endpoint,
    searchTerm,
    labelColumn: optionLabelKey,
    valueColumn: optionValueKey,
    pageSize,
    parentRecord,
    baseFilter,
  });

  // On load this Autocomplete will only have values. To render properly we need the complete options (the label as well for each value).
  const { data: initialOptions = [], isFetching: isFetchingInitialOptions } = useGetInitialOptions({
    endpoint,
    values: initialValueAsArray,
    labelColumn: optionLabelKey,
    valueColumn: optionValueKey,
    parentRecord,
    baseFilter,
  });

  useEffect(() => {
    setSelection(initialOptions);
  }, [initialOptions]);

  const onChangeSelection = (event, newSelection, reason) => {
    if (newSelection === null) {
      onChange(null);
    } else if (allowMultipleValues) {
      const newValues = newSelection.map(selected => selected[optionValueKey]);
      if (reason === 'create-option') {
        newValues[newValues.length - 1] = event.target.value;
      }
      onChange(newValues);
    } else {
      onChange(newSelection[optionValueKey]);
    }

    // @see https://material-ui.com/api/autocomplete for a description of reasons
    if (reason === 'create-option') {
      const newValues = newSelection;
      newValues[newValues.length - 1] = { [optionLabelKey]: event.target.value };
      setSelection(newValues);
    } else {
      setSelection(newSelection);
    }
  };

  return (
    <Autocomplete
      value={selection}
      label={label}
      options={[...searchResults, ...initialOptions]}
      getOptionSelected={(option, selected) => option[optionLabelKey] === selected[optionLabelKey]}
      getOptionLabel={option => (option && option[optionLabelKey] ? option[optionLabelKey] : '')}
      isLoading={isFetchingInitialOptions || isSearching}
      onChangeSelection={onChangeSelection}
      onChangeSearchTerm={setSearchTerm}
      searchTerm={searchTerm}
      placeholder={selection.length > 0 ? null : placeholder}
      helperText={helperText}
      canCreateNewOptions={canCreateNewOptions}
      allowMultipleValues={allowMultipleValues}
      optionLabelKey={optionLabelKey}
      disabled={isFetchingInitialOptions}
    />
  );
};

ResourceAutocomplete.propTypes = {
  placeholder: PropTypes.string,
  initialValue: PropTypes.oneOf(PropTypes.string, PropTypes.array),
  label: PropTypes.string,
  helperText: PropTypes.string,
  endpoint: PropTypes.string.isRequired,
  optionLabelKey: PropTypes.string.isRequired,
  optionValueKey: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  canCreateNewOptions: PropTypes.bool,
  allowMultipleValues: PropTypes.bool,
  parentRecord: PropTypes.string,
  baseFilter: PropTypes.object,
  pageSize: PropTypes.number,
};

ResourceAutocomplete.defaultProps = {
  placeholder: 'Start typing to search',
  initialValue: [],
  label: null,
  helperText: null,
  canCreateNewOptions: null,
  allowMultipleValues: null,
  parentRecord: null,
  baseFilter: null,
  pageSize: null,
};
