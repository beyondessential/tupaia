/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { DatePicker as BaseDatePicker } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';

export const DatePicker = ({ name, defaultValue, hasDefaultValue, inputFilterValue, onChange }) => {
  useEffect(() => {
    onChange(defaultValue);
  }, [hasDefaultValue]);

  return <BaseDatePicker label={name} onChange={onChange} value={inputFilterValue} />;
};
DatePicker.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
};
