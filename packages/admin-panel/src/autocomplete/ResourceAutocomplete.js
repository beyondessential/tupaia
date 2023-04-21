/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Autocomplete } from './Autocomplete';
import { useSearchResults } from './useSearchResults';

const getPlaceholder = (placeholder, selection) => {
  if (selection && selection.length) {
    return null;
  }

  if (placeholder) {
    return Array.isArray(placeholder) ? placeholder.join(', ') : placeholder;
  }
  return 'Start typing to search';
};

export const ResourceAutocomplete = ({
  placeholder,
  label,
  helperText,
  endpoint,
  optionLabelKey,
  optionValueKey,
  // eslint-disable-next-line no-unused-vars
  onChange,
  canCreateNewOptions,
  allowMultipleValues,
  parentRecord,
  baseFilter,
  pageSize,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data = [], isFetching } = useSearchResults({
    endpoint,
    searchTerm,
    labelColumn: optionLabelKey,
    valueColumn: optionValueKey,
    pageSize,
    parentRecord,
    baseFilter,
  });

  // eslint-disable-next-line no-unused-vars
  const [selection, setSelection] = useState([]);

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
      options={data}
      getOptionSelected={(option, selected) => option[optionLabelKey] === selected[optionLabelKey]}
      getOptionLabel={option => (option && option[optionLabelKey] ? option[optionLabelKey] : '')}
      isLoading={isFetching}
      onChangeSelection={onChangeSelection}
      onChangeSearchTerm={setSearchTerm}
      searchTerm={searchTerm}
      placeholder={getPlaceholder(placeholder, selection)}
      helperText={helperText}
      canCreateNewOptions={canCreateNewOptions}
      allowMultipleValues={allowMultipleValues}
      optionLabelKey={optionLabelKey}
    />
  );
};

ResourceAutocomplete.propTypes = {
  placeholder: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
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
  placeholder: [],
  label: null,
  helperText: null,
  canCreateNewOptions: null,
  allowMultipleValues: null,
  parentRecord: null,
  baseFilter: null,
  pageSize: null,
};
