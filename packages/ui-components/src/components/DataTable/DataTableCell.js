/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { TableCell } from '@material-ui/core';

const getDataType = value => (value === null ? 'null' : typeof value);

const formatValue = value => {
  const type = getDataType(value);
  switch (type) {
    case 'null':
      return 'NULL';
    case 'object':
      return JSON.stringify(value);
    case 'function':
      return '[Function]';
    default:
      return `${value}`;
  }
};

export const DataTableCell = ({ value, ...props }) => {
  return (
    <TableCell {...props} className={`data-type-${getDataType(value)}`}>
      {formatValue(value)}
    </TableCell>
  );
};

DataTableCell.propTypes = {
  value: PropTypes.oneOf([
    PropTypes.number,
    PropTypes.string,
    PropTypes.bool,
    PropTypes.object,
    PropTypes.func,
  ]).isRequired,
};

DataTableCell.defaultProps = {};
