/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Container } from '@material-ui/core';
import { useUsers } from '../api/queries';
import * as COLORS from '../constants';
import { DataGrid, UserPermissionsCell, PageHeader, FetchLoader } from '../components';

const Section = styled.section`
  display: flex;
  background: ${COLORS.GREY_F9};
  padding-top: 1.6rem;
  padding-bottom: 3rem;
  min-height: 70vh;

  .MuiDataGrid-root {
    background: white;
  }
`;

const Text = styled(Typography)`
  font-size: 1.125rem;
  line-height: 1.4rem;
  margin-bottom: 1rem;
`;

const columns = [
  { accessor: 'firstName', Header: 'First Name' },
  { accessor: 'lastName', Header: 'Last Name' },
  { accessor: 'email', Header: 'Email' },
  { accessor: 'mobileNumber', Header: 'Contact Number' },
  { accessor: 'employer', Header: 'Employer' },
  { accessor: 'position', Header: 'Position' },
  {
    accessor: 'permissionGroupName',
    Header: 'Permissions',
    Cell: UserPermissionsCell,
  },
];

export const UsersView = () => {
  const { isLoading, isError, error, data } = useUsers();

  return (
    <>
      <PageHeader
        title="Users and Permissions"
        breadcrumbs={[{ name: 'Users and Permissions', url: '/users-and-permissions' }]}
      />
      <Section>
        <Container maxWidth="lg">
          <FetchLoader isLoading={isLoading} isError={isError} error={error}>
            <Text>{data?.length} users</Text>
            <DataGrid data={data} columns={columns} />
          </FetchLoader>
        </Container>
      </Section>
    </>
  );
};
