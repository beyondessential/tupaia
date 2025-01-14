import React from 'react';

import PropTypes from 'prop-types';

import { ParameterType } from '../../editing';
import { ReduxAutocomplete } from '../../../../autocomplete';
import { getTextFieldValue } from './utils';

export const DataGroupCodeField = ({ name, onChange }) => {
  return (
    <ReduxAutocomplete
      key="dataGroupCode"
      inputKey="dataGroupCodeField"
      label={name}
      onChange={selectedValue => onChange(getTextFieldValue(selectedValue))}
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
