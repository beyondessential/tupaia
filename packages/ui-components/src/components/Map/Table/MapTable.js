/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { getMapTableData } from './getMapTableData';
import { DataTable } from '../../DataTable';

export const MapTable = ({ serieses, measureData, className }) => {
  const { columns, data } = getMapTableData(serieses, measureData);

  return <DataTable className={className} columns={columns} data={data} />;
};

MapTable.propTypes = {
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

MapTable.defaultProps = {
  measureData: [],
  serieses: [],
  className: null,
};
