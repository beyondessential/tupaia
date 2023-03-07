/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';

import { TextField as BaseTextField } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';

const getNumberValue = value => {
  if (typeof value === 'number') {
    return value;
  }
  return '';
};

export const NumberField = ({ id, name, value, onChange, config }) => {
  const defaultValue = getNumberValue(config?.hasDefaultValue && config?.defaultValue);
  const numberValue = getNumberValue(value);

  return (
    <BaseTextField
      id={id}
      name={name}
      placeholder={defaultValue.toString()}
      type="number"
      label={name}
      value={numberValue}
      onChange={event => {
        onChange(+event.target.value);
      }}
    />
  );
};

NumberField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
};

NumberField.defaultProps = {
  value: null,
};
