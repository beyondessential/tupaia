/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import PropTypes from 'prop-types';

export const ParameterType = {
  id: PropTypes.string,
  name: PropTypes.string,
  config: PropTypes.shape({
    type: PropTypes.string,
    hasDefaultValue: PropTypes.bool,
    defaultValue: PropTypes.string,
  }),
};

export const ParametersType = PropTypes.arrayOf(PropTypes.shape(ParameterType));
