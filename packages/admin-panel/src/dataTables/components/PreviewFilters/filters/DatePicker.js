/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';
import React from 'react';

import { DatePicker as BaseDatePicker } from '@tupaia/ui-components';
import { ParameterType } from '../../editing';

export const DatePicker = ({ name, value, onChange }) => {
  return <BaseDatePicker label={name} onChange={onChange} value={value} />;
};
DatePicker.propTypes = {
  ...ParameterType,
  onChange: PropTypes.func.isRequired,
};
