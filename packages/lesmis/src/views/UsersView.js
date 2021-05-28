/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import { Typography, Container } from '@material-ui/core';
import { useUsers } from '../api/queries';
import * as COLORS from '../constants';
import { Breadcrumbs, Toolbar } from '../components';
import { DataGrid } from '../components/DataGrid/DataGrid';

const Section = styled.section`
  background: ${COLORS.GREY_F9};
  padding-top: 3rem;
  padding-bottom: 3rem;
  min-height: 70vh;

  .MuiDataGrid-root {
    background: white;
  }
`;

const TitleContainer = styled.div`
  padding-top: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Title = styled(Typography)`
  font-weight: 600;
  font-size: 1.75rem;
  line-height: 2.6rem;
`;

export const UsersView = () => {
  const { isLoading, data } = useUsers();

  const columns = React.useMemo(() => [
    { accessor: 'firstName', Header: 'First Name' },
    { accessor: 'lastName', Header: 'Last Name' },
    { accessor: 'email', Header: 'Email' },
    { accessor: 'mobileNumber', Header: 'Contact Number' },
    { accessor: 'employer', Header: 'Employer' },
    { accessor: 'position', Header: 'Position' },
    { accessor: 'permissionGroupName', Header: 'Permissions' },
  ]);

  return (
    <>
      <Toolbar>
        <Breadcrumbs breadcrumbs={[{ name: 'Admin', url: '/admin' }]} />
      </Toolbar>
      <TitleContainer>
        <Container maxWidth="lg">
          <Title variant="h1">Users and Permissions</Title>
        </Container>
      </TitleContainer>
      <Section>
        <Container maxWidth="lg">
          {isLoading ? 'loading...' : <DataGrid data={data} columns={columns} />}
        </Container>
      </Section>
    </>
  );
};
