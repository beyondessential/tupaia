/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Select, { Creatable } from 'react-select';
import 'react-select/dist/react-select.css';
import { getAutocompleteState } from './selectors';
import { changeSelection, changeSearchTerm, clearState } from './actions';

const DEFAULT_PLACEHOLDER = 'Start typing to search';

const shouldCommaCreateOption = () => false;

class AutocompleteComponent extends React.Component {
  componentWillMount() {
    this.props.onChangeSearchTerm(''); // Fetch the initial list of options
  }

  componentWillUnmount() {
    this.props.onClearState();
  }

  render() {
    const {
      selection,
      onChangeSelection,
      onChangeSearchTerm,
      optionLabelKey,
      isLoading,
      results,
      placeholder: customPlaceholder,
      searchTerm,
      allowMultipleValues,
    } = this.props;
    const getPlaceholder = () => {
      if (customPlaceholder) {
        return Array.isArray(customPlaceholder) ? customPlaceholder.join(', ') : customPlaceholder;
      }
      return DEFAULT_PLACEHOLDER;
    };
    const SelectComponent = this.props.canCreateNewOptions ? Creatable : Select;
    return (
      <SelectComponent
        value={selection}
        onChange={onChangeSelection}
        onInputChange={onChangeSearchTerm}
        labelKey={optionLabelKey}
        valueKey={optionLabelKey}
        options={results}
        isLoading={isLoading}
        placeholder={getPlaceholder()}
        multi={allowMultipleValues}
        clearable={false}
        newOptionCreator={option => ({ [option.valueKey]: searchTerm })}
        shouldKeyDownEventCreateNewOption={shouldCommaCreateOption}
      />
    );
  }
}

AutocompleteComponent.propTypes = {
  allowMultipleValues: PropTypes.bool,
  canCreateNewOptions: PropTypes.bool,
  isLoading: PropTypes.bool.isRequired,
  onChangeSearchTerm: PropTypes.func.isRequired,
  onChangeSelection: PropTypes.func.isRequired,
  onClearState: PropTypes.func.isRequired,
  optionLabelKey: PropTypes.string.isRequired,
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  results: PropTypes.array,
  searchTerm: PropTypes.string,
  selection: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

AutocompleteComponent.defaultProps = {
  allowMultipleValues: false,
  placeholder: null,
  selection: undefined,
  results: undefined,
  canCreateNewOptions: false,
  searchTerm: '',
};

const mapStateToProps = (state, { reduxId }) => ({
  ...getAutocompleteState(state, reduxId),
});

const mapDispatchToProps = (
  dispatch,
  {
    endpoint,
    optionLabelKey,
    optionValueKey,
    reduxId,
    onChange,
    parentRecord,
    allowMultipleValues,
  },
) => ({
  onChangeSelection: newSelection => {
    const newValue = allowMultipleValues
      ? newSelection.map(s => s[optionValueKey])
      : newSelection[optionValueKey];
    onChange(newValue);
    dispatch(changeSelection(reduxId, newSelection));
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
      ),
    ),
  onClearState: () => dispatch(clearState(reduxId)),
});

export const Autocomplete = connect(mapStateToProps, mapDispatchToProps)(AutocompleteComponent);
