import PropTypes from 'prop-types';
import React from 'react';

import { Select } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';

const getBooleanValue = value => {
  if (typeof value === 'string') {
    return Boolean.valueOf(value);
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return undefined;
};

export const BooleanField = ({ name, value, onChange, config }) => {
  const defaultValue =
    typeof config?.defaultValue === 'boolean' ? `${config?.defaultValue}` : undefined;

  const booleanValue = getBooleanValue(value);

  return (
    <Select
      id={name}
      placeholder={defaultValue}
      options={[
        { label: 'none', value: undefined },
        { label: 'true', value: true },
        { label: 'false', value: false },
      ]}
      name={name}
      label={name}
      value={booleanValue}
      onChange={event => {
        onChange(event.target.value);
      }}
    />
  );
};

BooleanField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.bool,
};

BooleanField.defaultProps = {
  value: null,
};
