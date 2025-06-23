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
    <MuiDataGrid rows={rows} columns={columns} autoPageSize={autoPageSize} density={density} />
  );
};
