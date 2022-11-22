/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import throttle from 'lodash.throttle';
import { connect } from 'react-redux';
import MuiChip from '@material-ui/core/Chip';
import { createFilterOptions } from '@material-ui/lab/Autocomplete';
import styled from 'styled-components';
import { Autocomplete as AutocompleteBase } from '@tupaia/ui-components';
import { getAutocompleteState } from './selectors';
import { changeSelection, changeSearchTerm, clearState } from './actions';

const Chip = styled(MuiChip)`
  &:first-child {
    margin-left: 6px;
  }
`;

const getPlaceholder = (placeholder, selection) => {
  if (selection && selection.length) {
    return null;
  }

  if (placeholder) {
    return Array.isArray(placeholder) ? placeholder.join(', ') : placeholder;
  }
  return 'Start typing to search';
};

const filter = createFilterOptions();

const AutocompleteComponent = React.memo(
  ({
    onChangeSelection,
    onChangeSearchTerm,
    selection,
    isLoading,
    results,
    label,
    onClearState,
    optionLabelKey,
    allowMultipleValues,
    canCreateNewOptions,
    searchTerm,
    placeholder,
    helperText,
  }) => {
    React.useEffect(() => {
      onChangeSearchTerm('');

      return () => {
        onClearState();
      };
    }, []);

    let value = selection;

    // If value is null and  multiple is true mui autocomplete will crash
    if (allowMultipleValues && selection === null && !searchTerm) {
      value = [];
    }

    return (
      <AutocompleteBase
        value={value}
        label={label}
        options={results}
        getOptionSelected={(option, selected) =>
          option[optionLabelKey] === selected[optionLabelKey]
        }
        getOptionLabel={option => (option && option[optionLabelKey] ? option[optionLabelKey] : '')}
        loading={isLoading}
        onChange={onChangeSelection}
        onInputChange={throttle((event, newValue) => onChangeSearchTerm(newValue), 50)}
        inputValue={searchTerm}
        placeholder={getPlaceholder(placeholder, selection)}
        helperText={helperText}
        muiProps={{
          filterOptions: (options, params) => {
            const filtered = filter(options, params);

            // Suggest the creation of a new value
            if (canCreateNewOptions && params.inputValue !== '') {
              filtered.push({
                [optionLabelKey]: params.inputValue,
              });
            }

            return filtered;
          },
          freeSolo: canCreateNewOptions,
          disableClearable: allowMultipleValues,
          multiple: allowMultipleValues,
          selectOnFocus: canCreateNewOptions,
          clearOnBlur: canCreateNewOptions,
          handleHomeEndKeys: canCreateNewOptions,
          renderTags: (values, getTagProps) =>
            values.map((option, index) => (
              <Chip color="primary" label={option[optionLabelKey]} {...getTagProps({ index })} />
            )),
        }}
      />
    );
  },
);

AutocompleteComponent.propTypes = {
  allowMultipleValues: PropTypes.bool,
  canCreateNewOptions: PropTypes.bool,
  isLoading: PropTypes.bool.isRequired,
  onChangeSearchTerm: PropTypes.func.isRequired,
  onChangeSelection: PropTypes.func.isRequired,
  onClearState: PropTypes.func.isRequired,
  optionLabelKey: PropTypes.string.isRequired,
  results: PropTypes.arrayOf(PropTypes.object),
  searchTerm: PropTypes.string,
  placeholder: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  label: PropTypes.string,
  helperText: PropTypes.string,
  selection: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

AutocompleteComponent.defaultProps = {
  allowMultipleValues: false,
  selection: [],
  results: [],
  canCreateNewOptions: false,
  searchTerm: null,
  placeholder: null,
  label: null,
  helperText: null,
};

const mapStateToProps = (state, { reduxId }) => {
  const { selection, searchTerm, results, isLoading, fetchId } = getAutocompleteState(
    state,
    reduxId,
  );
  return { selection, searchTerm, results, isLoading, fetchId };
};

const mapDispatchToProps = (
  dispatch,
  {
    endpoint,
    optionLabelKey,
    optionValueKey,
    reduxId,
    onChange,
    parentRecord = {},
    allowMultipleValues,
    baseFilter,
    pageSize,
  },
) => ({
  onChangeSelection: (event, newSelection, reason) => {
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
      dispatch(changeSelection(reduxId, newValues));
    } else {
      dispatch(changeSelection(reduxId, newSelection));
    }
  },
  onChangeSearchTerm: newSearchTerm =>
    dispatch(
      changeSearchTerm(
        reduxId,
        endpoint,
        optionLabelKey,
        optionValueKey,
        newSearchTerm,
        parentRecord,
        baseFilter,
        pageSize,
      ),
    ),
  onClearState: () => dispatch(clearState(reduxId)),
});

export const Autocomplete = connect(mapStateToProps, mapDispatchToProps)(AutocompleteComponent);
