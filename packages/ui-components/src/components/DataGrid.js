/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { DataGrid as MuiDataGrid } from '@mui/x-data-grid';

export const DataGrid = ({ columns, rows }) => {
  return <MuiDataGrid columns={columns} rows={rows} density="compact" disableSelectionOnClick />;
};

DataGrid.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};
