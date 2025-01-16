import React, { useState } from 'react';
import styled from 'styled-components';
import * as COLORS from '.../helpers/theme/colors';
import { Table, LoadingContainer } from '../../src/components';
import { useTableData } from '../../helpers/useTableData';

export default {
  title: 'Tables/Table',
  component: Table,
};

const Container = styled.div`
  width: 100%;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY};

  > div {
    max-width: 900px;
    margin: 0 auto;
  }
`;

const columns = [
  {
    title: 'Name',
    key: 'name',
  },
  {
    title: 'Surname',
    key: 'surname',
  },
  {
    title: 'Email',
    key: 'email',
  },
];

export const SimpleTable = () => {
  const { loading, data } = useTableData();

  return (
    <Container>
      <Table
        columns={columns}
        data={data}
        loading={loading}
        onRowClick={() => {
          console.log('click on row...');
        }}
      />
    </Container>
  );
};

export const ErroredTable = () => {
  const { loading, data } = useTableData();

  return (
    <Container>
      <LoadingContainer errorMessage="Network Error. Please try again">
        <Table
          columns={columns}
          data={data}
          loading={loading}
          onRowClick={() => {
            console.log('click on row...');
          }}
        />
      </LoadingContainer>
    </Container>
  );
};

export const ErroredTableWithTryAgainButton = () => {
  const { loading, data } = useTableData();
  const [errorMessage, setErrorMessage] = useState('Network Error. Please try again');

  return (
    <Container>
      <LoadingContainer
        onReset={() => {
          setErrorMessage(null);
        }}
        errorMessage={errorMessage}
      >
        <Table
          columns={columns}
          data={data}
          loading={loading}
          onRowClick={() => {
            console.log('click on row...');
          }}
        />
      </LoadingContainer>
    </Container>
  );
};
