/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { DataGrid as MuiDataGrid } from '@mui/x-data-grid';

export const DataGrid = ({ columns, rows }) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flexGrow: 1 }}>
          <MuiDataGrid
            columns={columns}
            rows={rows}
            density="compact"
            showColumnRightBorder
            disableExtendRowFullWidth
            disableSelectionOnClick
          />
        </div>
      </div>
    </div>
  );
};

DataGrid.propTypes = {
  columns: PropTypes.array.isRequired,
  rows: PropTypes.array.isRequired,
};
