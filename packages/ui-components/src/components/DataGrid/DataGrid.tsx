/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { DataGrid as MuiDataGrid, DataGridProps } from '@mui/x-data-grid';

export const DataGrid = ({
  autoPageSize = false,
  density = 'compact',
  ...props
}: DataGridProps) => {
  return <MuiDataGrid autoPageSize={autoPageSize} density={density} {...props} />;
};
