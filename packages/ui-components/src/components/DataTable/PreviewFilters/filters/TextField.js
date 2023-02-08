/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { TextField as BaseTextField } from '../../../Inputs';
import { ParameterType } from '../../editing';

export const TextField = ({
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
    <BaseTextField
      id={id}
      name={name}
      placeholder="Text"
      type="text"
      label={name}
      value={inputFilterValue}
      onChange={event => {
        onChange(event.target.value);
      }}
    />
  );
};

TextField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
};
