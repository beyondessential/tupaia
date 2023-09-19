/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DataGrid as MuiDataGrid, GridRowsProp, GridColDef, GridDensity } from '@mui/x-data-grid';

interface DataGridProps {
  columns: GridColDef[];
  rows: GridRowsProp;
  autoPageSize?: boolean;
  density?: GridDensity;
}

export const DataGrid = ({
  columns,
  rows,
  autoPageSize = false,
  density = 'compact',
}: DataGridProps) => {
  return (
    <div style={{ height: 300, width: '100%' }}>
      <MuiDataGrid rows={rows} columns={columns} autoPageSize={autoPageSize} density={density} />
    </div>
  );
};
