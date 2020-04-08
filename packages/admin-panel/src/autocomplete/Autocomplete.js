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
      placeholder,
      searchTerm,
      allowMultipleValues,
    } = this.props;
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
        placeholder={placeholder}
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
  placeholder: PropTypes.string,
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
  { endpoint, optionLabelKey, reduxId, onChange, searchTermFilter },
) => ({
  onChangeSelection: newSelection => {
    onChange(newSelection);
    dispatch(changeSelection(reduxId, newSelection));
  },
  onChangeSearchTerm: newSearchTerm =>
    dispatch(changeSearchTerm(reduxId, endpoint, optionLabelKey, newSearchTerm, searchTermFilter)),
  onClearState: () => dispatch(clearState(reduxId)),
});

export const Autocomplete = connect(mapStateToProps, mapDispatchToProps)(AutocompleteComponent);
