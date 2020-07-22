/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import PropTypes from 'prop-types';

export const tableColumnShape = {
  key: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  accessor: PropTypes.func,
  CellComponent: PropTypes.any,
  sortable: PropTypes.bool,
};
