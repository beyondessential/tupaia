/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { DataTable } from '@tupaia/ui-components';
import { useMapTable } from './useMapTable';

export const Table = ({ serieses, measureData, className }) => {
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows, columns } = useMapTable(
    serieses,
    measureData,
  );

  return (
    <DataTable
      className={className}
      getTableProps={getTableProps}
      getTableBodyProps={getTableBodyProps}
      headerGroups={headerGroups}
      prepareRow={prepareRow}
      rows={rows}
      columns={columns}
    />
  );
};

Table.propTypes = {
  measureData: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
    }),
  ),
  serieses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  className: PropTypes.string,
};

Table.defaultProps = {
  measureData: [],
  serieses: [],
  className: null,
};
