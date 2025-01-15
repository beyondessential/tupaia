import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getAutocompleteState } from './selectors';
import { changeSelection, changeSearchTerm, clearState } from './actions';
import { Autocomplete } from './Autocomplete';
import { EntityOptionLabel } from '../widgets';

const getPlaceholder = (placeholder, selection) => {
  if (selection && selection.length) {
    return null;
  }

  if (placeholder) {
    return Array.isArray(placeholder) ? placeholder.join(', ') : placeholder;
  }
  return 'Start typing to search';
};

const ReduxAutocompleteComponent = ({
  onChangeSelection,
  onChangeSearchTerm,
  selection,
  programaticallyChangeSelection,
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
  error,
  tooltip,
  optionValueKey,
  renderOption,
  optionFields,
}) => {
  const [hasUpdated, setHasUpdated] = React.useState(false);
  React.useEffect(() => {
    return () => {
      onClearState();
    };
  }, []);

  // on initial load, set the selection to the initialValue
  useEffect(() => {
    if (hasUpdated || !initialValue) return;
    const needToUpdate = allowMultipleValues
      ? JSON.stringify(initialValue) !== JSON.stringify(selection?.map(s => s[optionLabelKey]))
      : initialValue !== selection?.[optionValueKey];

    if (needToUpdate) {
      programaticallyChangeSelection(initialValue);
    }
    setHasUpdated(true);
  }, [JSON.stringify(initialValue), JSON.stringify(selection)]);

  let selectedValue = selection;

  // If value is null and  multiple is true mui autocomplete will crash
  if (allowMultipleValues && selection === null && !searchTerm) {
    selectedValue = [];
  }

  const getOptionRendered = option => {
    if (renderOption) return renderOption(option);
    if (!option || !option[optionLabelKey]) return '';
    return option[optionLabelKey];
  };

  return (
    <Autocomplete
      value={selectedValue}
      label={label}
      options={results}
      getOptionSelected={(option, selected) => option[optionLabelKey] === selected[optionLabelKey]}
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
      required={required}
      error={error}
      tooltip={tooltip}
      renderOption={getOptionRendered}
    />
  );
};

ReduxAutocompleteComponent.propTypes = {
  allowMultipleValues: PropTypes.bool,
  canCreateNewOptions: PropTypes.bool,
  isLoading: PropTypes.bool.isRequired,
  programaticallyChangeSelection: PropTypes.func.isRequired,
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
  error: PropTypes.bool,
  optionValueKey: PropTypes.string.isRequired,
  renderOption: PropTypes.func,
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
  error: false,
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
    optionFields,
  },
) => ({
  programaticallyChangeSelection: initialValue => {
    const formattedInitialValue = allowMultipleValues
      ? initialValue?.map(value => ({ [optionLabelKey]: value, [optionValueKey]: value }))
      : { [optionLabelKey]: initialValue, [optionValueKey]: initialValue };

    return dispatch(
      changeSelection(
        reduxId,
        // Note: This will look incorrect if we're using a different optionLabelKey to optionValueKey (as the selected option will have the 'value' as the label)
        // However the same issue exists with the placeholder, and in practice we rarely use different keys for labels and values in multi-select
        formattedInitialValue,
      ),
    );
  },
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
        optionFields,
      ),
    ),
  onClearState: () => dispatch(clearState(reduxId)),
});

export const ReduxAutocomplete = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ReduxAutocompleteComponent);
