/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';

export const ParametersType = PropTypes.arrayOf(PropTypes.shape(ParameterType));

export const ParameterType = {
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
  hasDefaultValue: PropTypes.bool,
  defaultValue: PropTypes.string,
  inputFilterValue: PropTypes.any,
};
