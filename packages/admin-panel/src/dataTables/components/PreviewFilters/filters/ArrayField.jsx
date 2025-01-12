import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { ParameterType } from '../../editing';
import { Autocomplete } from '../../../../autocomplete';
import { getArrayFieldValue } from './utils';

export const ArrayField = ({ name, onChange, value, config }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { defaultValue } = config || {};
  const placeholder = value.length === 0 ? JSON.stringify(defaultValue) : 'type to add more';

  return (
    <Autocomplete
      placeholder={placeholder}
      value={value}
      label={name}
      options={[]}
      onChangeSelection={(event, selectedValues) => onChange(getArrayFieldValue(selectedValues))}
      getOptionSelected={(option, selected) => {
        return option === selected;
      }}
      getOptionLabel={option => option}
      searchTerm={searchTerm}
      onChangeSearchTerm={setSearchTerm}
      allowMultipleValues
      canCreateNewOptions
    />
  );
};

ArrayField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.array,
};

ArrayField.defaultProps = {
  value: [],
};
