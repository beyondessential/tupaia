/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Alarm } from '@material-ui/icons';
import { DataFetchingTable } from '../components/DataFetchingTable';

export default {
  title: 'DataFetchingTable',
};

const Container = styled.div`
  max-width: 800px;
  margin: 1rem;
`;

const getDisplayName = ({ name }) => (
  <React.Fragment>
    {name} <Alarm />
  </React.Fragment>
);

export const DataTable = () => {
  const columns = React.useMemo(
    () => [
      {
        title: 'Name',
        key: 'name',
        // accessor: getDisplayName,
      },
      {
        title: 'Surname',
        key: 'surname',
      },
      {
        title: 'Email',
        key: 'email',
      },
    ],
    [],
  );
  return (
    <Container>
      <DataFetchingTable endpoint="surveys" columns={columns} />
    </Container>
  );
};
