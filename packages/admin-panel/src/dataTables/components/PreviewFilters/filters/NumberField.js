/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';

import { TextField as BaseTextField } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';

export const NumberField = ({ id, name, value, onChange, config }) => {
  const defaultValue = config?.hasDefaultValue ? config?.defaultValue : null;

  return (
    <BaseTextField
      id={id}
      name={name}
      placeholder={defaultValue}
      type="number"
      label={name}
      value={value}
      onChange={event => {
        onChange(event.target.value);
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
