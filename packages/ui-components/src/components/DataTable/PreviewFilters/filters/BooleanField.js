/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { Select } from '../../../Inputs';
import { ParameterType } from '../../editing';

export const BooleanField = ({
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
    <Select
      options={[
        { label: 'true', value: true },
        { label: 'false', value: false },
      ]}
      id={id}
      name={name}
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

BooleanField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
};
