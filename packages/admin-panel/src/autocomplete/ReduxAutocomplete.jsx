/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getAutocompleteState } from './selectors';
import { changeSelection, changeSearchTerm, clearState } from './actions';
import { Autocomplete } from './Autocomplete';

const getPlaceholder = (placeholder, selection) => {
  if (selection && selection.length) {
    return null;
  }

  if (placeholder) {
    return Array.isArray(placeholder) ? placeholder.join(', ') : placeholder;
  }
  return 'Start typing to search';
};

const ReduxAutocompleteComponent = React.memo(
  ({
    onChangeSelection,
    onChangeSearchTerm,
    selection,
    setInitialSelection,
    initialValue,
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
    required,
    invalid,
  }) => {
    const [hasSetInitialSelection, setHasSetInitialSelection] = useState(false);

    React.useEffect(() => {
      return () => {
        onClearState();
      };
    }, []);

    // If working with a multi-value input, set the initial selection to the initial value so that users can easily add/remove from the existing values
    React.useEffect(() => {
      if (
        !hasSetInitialSelection &&
        allowMultipleValues &&
        initialValue &&
        initialValue.length > 0
      ) {
        setInitialSelection(initialValue);
        setHasSetInitialSelection(true);
      }
    }, [hasSetInitialSelection, allowMultipleValues, initialValue]);

    let value = selection;

    // If value is null and  multiple is true mui autocomplete will crash
    if (allowMultipleValues && selection === null && !searchTerm) {
      value = [];
    }

    return (
      <Autocomplete
        value={value}
        label={label}
        options={results}
        required={required}
        invalid={invalid}
        getOptionSelected={(option, selected) =>
          option[optionLabelKey] === selected[optionLabelKey]
        }
        getOptionLabel={option => (option && option[optionLabelKey] ? option[optionLabelKey] : '')}
        isLoading={isLoading}
        onChangeSelection={onChangeSelection}
        onChangeSearchTerm={onChangeSearchTerm}
        searchTerm={searchTerm}
        placeholder={getPlaceholder(placeholder, selection)}
        helperText={helperText}
        canCreateNewOptions={canCreateNewOptions}
        allowMultipleValues={allowMultipleValues}
        optionLabelKey={optionLabelKey}
      />
    );
  },
);

ReduxAutocompleteComponent.propTypes = {
  allowMultipleValues: PropTypes.bool,
  canCreateNewOptions: PropTypes.bool,
  isLoading: PropTypes.bool.isRequired,
  setInitialSelection: PropTypes.func.isRequired,
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
  initialValue: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  required: PropTypes.bool,
  invalid: PropTypes.bool,
};

ReduxAutocompleteComponent.defaultProps = {
  allowMultipleValues: false,
  selection: [],
  initialValue: [],
  results: [],
  canCreateNewOptions: false,
  searchTerm: null,
  placeholder: null,
  label: null,
  helperText: null,
  required: false,
  invalid: false,
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
    distinct,
  },
) => ({
  setInitialSelection: initialValue =>
    dispatch(
      changeSelection(
        reduxId,
        // Note: This will look incorrect if we're using a different optionLabelKey to optionValueKey (as the selected option will have the 'value' as the label)
        // However the same issue exists with the placeholder, and in practice we rarely use different keys for labels and values in multi-select
        initialValue.map(value => ({ [optionLabelKey]: value, [optionValueKey]: value })),
      ),
    ),
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
        distinct,
      ),
    ),
  onClearState: () => dispatch(clearState(reduxId)),
});

export const ReduxAutocomplete = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReduxAutocompleteComponent);
