/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { Select } from '../../../Inputs';
import { ParameterType } from '../../types';

export const BooleanField = ({
  id,
  name,
  defaultValue,
  hasDefaultValue,
  inputFilterValue,
  onChange,
}) => {
  useEffect(() => {
    onChange(defaultValue);
  }, [hasDefaultValue]);

  return (
    <Select
      options={[
        { label: 'true', value: true },
        { label: 'false', value: false },
      ]}
      id={id}
      name={name}
      label={name}
      value={inputFilterValue}
      onChange={event => {
        onChange(event.target.value);
      }}
    />
  );
};

BooleanField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
};
