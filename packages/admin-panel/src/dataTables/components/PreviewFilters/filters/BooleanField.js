/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { Select } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';

export const BooleanField = ({ name, value, onChange }) => {
  useEffect(() => {
    onChange(false);
  }, [!!value]);

  return (
    <Select
      options={[
        { label: 'true', value: true },
        { label: 'false', value: false },
      ]}
      name={name}
      label={name}
      value={value}
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
