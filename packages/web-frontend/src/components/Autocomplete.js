/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
// import throttle from 'lodash.throttle';
import styled from 'styled-components';
import { Autocomplete as AutocompleteUi } from '@tupaia/ui-components';

const AutocompleteBase = styled(AutocompleteUi)`
  margin: 5px 10px 5px 10px;
  color: white;

  .MuiInputBase-root {
    background-color: transparent;
  }
`;

export const Autocomplete = ({
  options,
  optionLabelKey,
  placeholder,
  setIsNewDashboardSelected,
  setSelectedNewDashboardOption,
}) => {
  const handleChange = (event, value) => {
    if (value === null) {
      setIsNewDashboardSelected(false);
    }
    setIsNewDashboardSelected(true);
    setSelectedNewDashboardOption(value);
  };

  return (
    <AutocompleteBase
      options={options}
      getOptionSelected={(option, selected) => option[optionLabelKey] === selected[optionLabelKey]}
      getOptionLabel={option => (option && option[optionLabelKey] ? option[optionLabelKey] : '')}
      placeholder={placeholder}
      onChange={handleChange}
    />
  );
};

Autocomplete.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  optionLabelKey: PropTypes.string.isRequired,
  optionValueKey: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  setIsNewDashboardSelected: PropTypes.func.isRequired,
  setSelectedNewDashboardOption: PropTypes.func.isRequired,
  setNewDashboardSpec: PropTypes.func.isRequired,
  newDashboardSpec: PropTypes.object.isRequired,
};
