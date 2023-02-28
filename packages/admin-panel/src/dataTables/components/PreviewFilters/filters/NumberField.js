/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { TextField as BaseTextField } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';

export const NumberField = ({ id, name, defaultValue, hasDefaultValue, onChange }) => {
  useEffect(() => {
    onChange(defaultValue);
  }, [hasDefaultValue]);

  return (
    <BaseTextField
      id={id}
      name={name}
      placeholder="number..."
      type="number"
      label={name}
      value={defaultValue}
      onChange={event => {
        onChange(event.target.value);
      }}
    />
  );
};

NumberField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
};
