import PropTypes from 'prop-types';
import React from 'react';
import { TextField as BaseTextField } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';
import { getTextFieldValue } from './utils';

export const TextField = ({ name, value, onChange, config }) => {
  const defaultValue = config?.defaultValue || '';

  return (
    <BaseTextField
      name={name}
      placeholder={defaultValue}
      type="text"
      label={name}
      value={value}
      onChange={event => {
        onChange(getTextFieldValue(event.target.value));
      }}
    />
  );
};

TextField.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string,
};

TextField.defaultProps = {
  value: '',
};
