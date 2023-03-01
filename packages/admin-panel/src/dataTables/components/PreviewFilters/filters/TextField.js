/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';
import { TextField as BaseTextField } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';

export const TextField = ({ id, name, value, onChange }) => {
  return (
    <BaseTextField
      id={id}
      name={name}
      placeholder="Text"
      type="text"
      label={name}
      value={value}
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
