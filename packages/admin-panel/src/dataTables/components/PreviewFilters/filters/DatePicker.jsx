import PropTypes from 'prop-types';
import React from 'react';
import format from 'date-fns/format';

import { DatePicker as BaseDatePicker } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';

const getDateValue = value => {
  let dateValue = null;

  if (value instanceof Date) {
    dateValue = value;
  }

  if (typeof value === 'string') {
    dateValue = new Date(value);
  }

  if (!dateValue || dateValue.toString() === 'Invalid Date') {
    return null;
  }

  return dateValue;
};

export const DatePicker = ({ name, value, onChange, config }) => {
  const dateValue = getDateValue(value);
  const defaultDateValue = getDateValue(config?.defaultValue);
  // Convert date to UTC as server uses UTC timezone
  const onChangeDate = localDate => {
    if (!localDate) {
      return;
    }
    const UTCDate = new Date(
      Date.UTC(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()),
    );
    onChange(UTCDate);
  };

  return (
    <BaseDatePicker
      label={name || ''}
      onChange={onChangeDate}
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
