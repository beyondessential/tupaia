/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { DataGrid } from '../../src';
import { useTableData } from '../../helpers/useTableData';

export default {
  title: 'Tables/CompactDataGrid',
  component: DataGrid,
};

const columns = [
  {
    headerName: 'Name',
    field: 'name',
    width: 150,
  },
  {
    headerName: 'Surname',
    field: 'surname',
    width: 150,
  },
  {
    headerName: 'Email',
    field: 'email',
    width: 150,
  },
];

export const CompactDataGrid = () => {
  const { data } = useTableData();

  return (
    <div style={{ height: 600 }}>
      <DataGrid columns={columns} rows={data} />
    </div>
  );
};
