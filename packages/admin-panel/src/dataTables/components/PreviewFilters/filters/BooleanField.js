/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

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
    config?.hasDefaultValue && typeof config?.defaultValue === 'boolean'
      ? `${config?.defaultValue}`
      : undefined;

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
