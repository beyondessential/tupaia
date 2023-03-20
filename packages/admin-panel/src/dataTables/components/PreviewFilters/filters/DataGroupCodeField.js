/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import PropTypes from 'prop-types';

import { ParameterType } from '../../editing';
import { ReduxAutocomplete } from '../../../../autocomplete';

export const DataGroupCodeField = ({ name, onChange }) => {
  return (
    <ReduxAutocomplete
      key="dataGroupCode"
      inputKey="dataGroupCodeField"
      label={name}
      onChange={selectedValues => onChange(selectedValues)}
      id="inputField-dataGroupCode"
      reduxId="dataTableEditFields-dataGroupCodeField"
      endpoint="dataGroups"
      optionLabelKey="code"
      optionValueKey="code"
    />
  );
};

DataGroupCodeField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
};
