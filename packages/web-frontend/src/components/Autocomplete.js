/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
// import throttle from 'lodash.throttle';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Autocomplete as AutocompleteUi } from '@tupaia/ui-components';
import { getAutocompleteState } from '../selectors';
import { changeSelection } from '../autocomplete';

const AutocompleteBase = styled(AutocompleteUi)`
  margin: 5px 10px 5px 10px;
  color: white;

  .MuiInputBase-root {
    background-color: transparent;
  }
`;

const AutocompleteComponent = React.memo(
  ({ onChangeSelection, selection, isLoading, options, label, optionLabelKey, searchTerm }) => {
    // React.useEffect(() => {
    //   onChangeSearchTerm('');

    //   return () => {
    //     onClearState();
    //   };
    // }, []);

    const value = selection;

    return (
      <AutocompleteBase
        value={value}
        label={label}
        options={options}
        getOptionSelected={(option, selected) =>
          option[optionLabelKey] === selected[optionLabelKey]
        }
        getOptionLabel={option => (option && option[optionLabelKey] ? option[optionLabelKey] : '')}
        loading={isLoading}
        onChange={onChangeSelection}
        // onInputChange={throttle((event, newValue) => onChangeSearchTerm(newValue), 50)}
        inputValue={searchTerm}
        placeholder="Start typing to search"
      />
    );
  },
);

AutocompleteComponent.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  // onChangeSearchTerm: PropTypes.func.isRequired,
  onChangeSelection: PropTypes.func.isRequired,
  // onClearState: PropTypes.func.isRequired,
  optionLabelKey: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(PropTypes.object),
  searchTerm: PropTypes.string,
  placeholder: PropTypes.oneOfType([PropTypes.array, PropTypes.string]),
  label: PropTypes.string,
  selection: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
};

AutocompleteComponent.defaultProps = {
  selection: [],
  options: [],
  searchTerm: null,
  placeholder: null,
  label: null,
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
  { endpoint, optionLabelKey, optionValueKey, reduxId, onChange, baseFilter },
) => ({
  onChangeSelection: (event, newSelection) => {
    if (newSelection === null) {
      onChange(null);
    } else {
      onChange(newSelection[optionValueKey]);
    }

    dispatch(changeSelection(reduxId, newSelection));
  },
  // onChangeSearchTerm: newSearchTerm =>
  //   dispatch(
  //     changeSearchTerm(
  //       reduxId,
  //       endpoint,
  //       optionLabelKey,
  //       optionValueKey,
  //       newSearchTerm,
  //       baseFilter,
  //     ),
  //   ),
  // onClearState: () => dispatch(clearState(reduxId)),
});

export const Autocomplete = connect(mapStateToProps, mapDispatchToProps)(AutocompleteComponent);
