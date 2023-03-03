/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { DataGrid } from '../../src';
import { useTableData } from '../../helpers/useTableData';

export default {
  title: 'Tables/SimpleDataGrid',
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

export const SimpleDataGrid = () => {
  const { data } = useTableData();

  return (
    <div>
      <DataGrid columns={columns} rows={data} />
    </div>
  );
};
