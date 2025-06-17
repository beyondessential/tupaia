import React from 'react';
import styled from 'styled-components';
import * as COLORS from '.../helpers/theme/colors';
import { DataGrid } from '../../src/components';

export default {
  title: 'Tables/DataGrid',
};

const Container = styled.div`
  width: 100%;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY};
  height: 600px;

  > div {
    max-width: 900px;
    margin: 0 auto;
  }
`;

const rows = [
  { id: 1, col1: 'Hello', col2: 'World' },
  { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
  { id: 3, col1: 'Material-UI', col2: 'is Amazing' },
  { id: 4, col1: 'Hello', col2: 'World' },
  { id: 5, col1: 'DataGridPro', col2: 'is Awesome' },
  { id: 6, col1: 'Material-UI', col2: 'is Amazing' },
  { id: 7, col1: 'Hello', col2: 'World' },
  { id: 8, col1: 'DataGridPro', col2: 'is Awesome' },
  { id: 9, col1: 'Material-UI', col2: 'is Amazing' },
];

const columns = [
  { field: 'col1', headerName: 'Column 1', width: 150 },
  { field: 'col2', headerName: 'Column 2', width: 150 },
];

const columnsWithFlex = [
  { field: 'col1', headerName: 'Column 1', minWidth: 150, flex: 1 },
  { field: 'col2', headerName: 'Column 2', minWidth: 150, flex: 1 },
];

export const Default = () => {
  return (
    <Container>
      <DataGrid columns={columns} rows={rows} />
    </Container>
  );
};

export const AutoPageSize = () => {
  return (
    <Container>
      <DataGrid columns={columns} rows={rows} autoPageSize={true} />
    </Container>
  );
};

export const FlexColumns = () => {
  return (
    <Container>
      <DataGrid columns={columnsWithFlex} rows={rows} />
    </Container>
  );
};
