/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { useTable, useFilters } from 'react-table';
import styled from 'styled-components';
import { Table, Typography, Container, TableHead, TableRow, TableBody } from '@material-ui/core';
import { TableCell, StyledTableRow, TextField } from '@tupaia/ui-components';
import { useUsers } from '../api/queries';
import * as COLORS from '../constants';
import { Breadcrumbs, Toolbar } from '../components';

const Section = styled.section`
  background: ${COLORS.GREY_F9};
  padding-top: 3rem;
  padding-bottom: 3rem;
  min-height: 70vh;

  .MuiDataGrid-root {
    //margin-top: 160px;
    background: white;
  }
`;

const TitleContainer = styled(Container)`
  padding-top: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Title = styled(Typography)`
  font-weight: 600;
  font-size: 1.75rem;
  line-height: 2.6rem;
`;

const StyledTable = styled(Table)`
  background: white;
  border: 1px solid ${props => props.theme.palette.grey['400']};
`;

// Define a default UI for filtering
function DefaultColumnFilter({ column: { filterValue, preFilteredRows, setFilter } }) {
  const count = preFilteredRows.length;

  return (
    <TextField
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder="Search"
    />
  );
}

// eslint-disable-next-line react/prop-types
const DataGrid = ({ data, columns }) => {
  const filterTypes = React.useMemo(
    () => ({
      text: (rows, id, filterValue) => {
        return rows.filter(row => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    [],
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultColumnFilter,
    }),
    [],
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      defaultColumn,
      filterTypes,
      columns,
      data,
    },
    useFilters,
  );

  return (
    <StyledTable {...getTableProps()}>
      <TableHead>
        {
          // Loop over the header rows
          headerGroups.map(headerGroup => (
            // Apply the header row props
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {
                // Loop over the headers in each row
                headerGroup.headers.map(column => (
                  // Apply the header cell props
                  <TableCell {...column.getHeaderProps()}>
                    {column.render('Header')}
                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                  </TableCell>
                ))
              }
            </TableRow>
          ))
        }
      </TableHead>
      {/* Apply the table body props */}
      <TableBody {...getTableBodyProps()}>
        {
          // Loop over the table rows
          rows.map(row => {
            // Prepare the row for display
            prepareRow(row);
            return (
              // Apply the row props
              <StyledTableRow {...row.getRowProps()}>
                {
                  // Loop over the rows cells
                  row.cells.map(cell => {
                    // Apply the cell props
                    return (
                      <TableCell {...cell.getCellProps()}>
                        {
                          // Render the cell contents
                          cell.render('Cell')
                        }
                      </TableCell>
                    );
                  })
                }
              </StyledTableRow>
            );
          })
        }
      </TableBody>
    </StyledTable>
  );
};

export const UsersView = () => {
  const { isLoading, data } = useUsers();

  const columns = React.useMemo(() => [
    { accessor: 'firstName', Header: 'First Name' },
    { accessor: 'lastName', Header: 'Last Name' },
    { accessor: 'email', Header: 'Email' },
    { accessor: 'mobileNumber', Header: 'Mobile Number' },
    { accessor: 'employer', Header: 'Employer' },
    { accessor: 'position', Header: 'Position' },
    { accessor: 'verifiedEmail', Header: 'Verified' },
  ]);

  return (
    <>
      <Toolbar>
        <Breadcrumbs breadcrumbs={[{ name: 'Admin', url: '/admin' }]} />
      </Toolbar>
      <TitleContainer maxWidth="lg">
        <Title variant="h1">Users and Permissions</Title>
      </TitleContainer>
      <Section>
        <Container maxWidth="lg">
          {isLoading ? 'loading...' : <DataGrid data={data} columns={columns} />}
        </Container>
      </Section>
    </>
  );
};
