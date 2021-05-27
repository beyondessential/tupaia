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
import { useUsers } from '../api/queries';
import * as COLORS from '../constants';
import { Breadcrumbs, Toolbar } from '../components';

const Section = styled.section`
  background: ${COLORS.GREY_F9};
  padding-top: 3rem;
  padding-bottom: 3rem;
  min-height: 70vh;

  .MuiDataGrid-root {
    background: white;
  }
`;

const TitleContainer = styled(MuiContainer)`
  padding-top: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Title = styled(Typography)`
  font-weight: 600;
  font-size: 1.75rem;
  line-height: 2.6rem;
`;

const columns = [
  { field: 'firstName', headerName: 'First Name', width: 180 },
  { field: 'lastName', headerName: 'Last Name', width: 180 },
  { field: 'email', headerName: 'Email', flex: 1 },
  { field: 'mobileNumber', headerName: 'Mobile Number', width: 190 },
  { field: 'employer', headerName: 'Employer', width: 180 },
  { field: 'position', headerName: 'Position', width: 180 },
  { field: 'verifiedEmail', headerName: 'Verified', type: 'boolean', width: 170 },
];

export const UsersView = () => {
  const { isLoading, data } = useUsers();

  return (
    <>
      <Toolbar>
        <Breadcrumbs breadcrumbs={[{ name: 'Admin', url: '/admin' }]} />
      </Toolbar>
      <TitleContainer maxWidth="lg">
        <Title variant="h1">Users and Permissions</Title>
      </TitleContainer>
      <Section>
        <MuiContainer maxWidth="lg">
          {isLoading ? (
            'loading...'
          ) : (
            <DataGrid
              rows={data}
              columns={columns}
              autoHeight
              pageSize={20}
              rowsPerPageOptions={[20, 50, 100]}
              pagination
            />
          )}
        </MuiContainer>
      </Section>
    </>
  );
};
