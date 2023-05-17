/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import PropTypes from 'prop-types';

export const CONDITIONAL_MATRIX_CONDITION_SHAPE = {
  key: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  label: PropTypes.string,
  legendLabel: PropTypes.string,
  condition: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired, // 0 or object e.g. { "<": 3 }
  description: PropTypes.string,
};

export const PRESENTATION_OPTIONS_SHAPE = {
  type: PropTypes.string,
  showRawValue: PropTypes.bool,
  exportWithLabels: PropTypes.bool,
  conditions: PropTypes.arrayOf(PropTypes.shape(CONDITIONAL_MATRIX_CONDITION_SHAPE)),
};
