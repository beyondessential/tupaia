/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { DataGrid } from '@material-ui/data-grid';
import MuiContainer from '@material-ui/core/Container';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Toolbar, Breadcrumbs } from '../components';
import { useUsers } from '../api/queries';

const Container = styled(MuiContainer)`
  padding-top: 3rem;
  min-height: 70vh;
`;

const Title = styled(Typography)`
  font-weight: 600;
  font-size: 1.75rem;
  line-height: 2.6rem;
`;

const breadcrumbs = [{ name: 'admin', url: 'admin' }];

const columns = [
  { field: 'firstName', headerName: 'First Name', width: 150 },
  { field: 'lastName', headerName: 'Last Name', width: 150 },
  { field: 'email', headerName: 'Email', width: 150 },
  { field: 'mobileNumber', headerName: 'Mobile Number', width: 150 },
  { field: 'employer', headerName: 'Employer', width: 150 },
  { field: 'position', headerName: 'Position', width: 150 },
  { field: 'verifiedEmail', headerName: 'Verified', width: 150 },
];

export const UsersView = () => {
  const { isLoading, data } = useUsers();

  return (
    <>
      <Toolbar>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </Toolbar>
      <Container maxWidth="lg">
        <Title variant="h1">Users and Permissions</Title>
        <div style={{ height: 1000, width: '100%' }}>
          {isLoading ? 'loading...' : <DataGrid rows={data} columns={columns} />}
        </div>
      </Container>
    </>
  );
};
