/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { TextField as BaseTextField } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';

export const NumberField = ({
  id,
  name,
  defaultValue,
  hasDefaultValue,
  inputFilterValue,
  onChange,
  haveTriedToFetch,
}) => {
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
      value={inputFilterValue}
      error={haveTriedToFetch && inputFilterValue === undefined}
      helperText={haveTriedToFetch && inputFilterValue === undefined && 'should not be empty'}
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
