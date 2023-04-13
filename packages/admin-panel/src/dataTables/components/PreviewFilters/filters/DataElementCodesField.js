/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';

import PropTypes from 'prop-types';

import { ParameterType } from '../../editing';
import { ReduxAutocomplete } from '../../../../autocomplete';

export const DataElementCodesField = ({ name, onChange }) => {
  return (
    <ReduxAutocomplete
      allowMultipleValues
      key="dataElementCodes"
      inputKey="dataElementCodesField"
      label={name}
      onChange={selectedValues => onChange(selectedValues)}
      id="inputField-dataElementCodes"
      reduxId="dataTableEditFields-dataElementCodesField"
      endpoint="dataElements"
      optionLabelKey="code"
      optionValueKey="code"
    />
  );
};

DataElementCodesField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
};
