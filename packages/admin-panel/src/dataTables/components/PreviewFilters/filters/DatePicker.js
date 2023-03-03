/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';
import format from 'date-fns/format';

import { DatePicker as BaseDatePicker } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';

const getDateValue = value => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'string') {
    return new Date(value);
  }

  return null;
};

export const DatePicker = ({ name, value, onChange, config }) => {
  const dateValue = getDateValue(value);
  const defaultDateValue = getDateValue(config?.hasDefaultValue && config?.defaultValue);

  return (
    <BaseDatePicker
      label={name}
      onChange={onChange}
      value={dateValue}
      placeholder={defaultDateValue && format(defaultDateValue, 'dd/MM/yyyy')}
    />
  );
};

DatePicker.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
};

DatePicker.defaultProps = {
  value: null,
};
