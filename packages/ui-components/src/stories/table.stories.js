/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { FakeAPI } from '../api';
import * as COLORS from '../theme/colors';
import {
  Table,
  FullTable,
  NestedTableBody,
  TableHeaders,
  TableBody,
  CustomHeader,
  TableContainer,
  TablePaginator,
  NestedTableContainer,
} from '../components/Table';
import { Button } from '..';

export default {
  title: 'Table',
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
];

const useTableData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = new FakeAPI();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const userData = await API.get('users');
      console.log('user data', userData);
      setLoading(false);
      setData(userData.data);
    })();
  }, []);

  return { loading, data };
};

export const SimpleTable = () => {
  const { loading, data } = useTableData();

  return (
    <Container>
      <FullTable columns={columns} data={data} loading={loading} />
    </Container>
  );
};

export const ComposedTable = () => {
  const { loading, data } = useTableData();

  return (
    <Container>
      <TableContainer>
        <Table columns={columns} data={data} loading={loading}>
          <TableHeaders />
          <TableBody />
          <TablePaginator />
        </Table>
      </TableContainer>
    </Container>
  );
};

export const zebraTable = () => {
  const { loading, data } = useTableData();

  return (
    <Container>
      <NestedTableContainer>
        <Table columns={columns} data={data} loading={loading}>
          <NestedTableBody />
        </Table>
      </NestedTableContainer>
    </Container>
  );
};

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
`;

const SubComponent = () => {
  const { loading, data } = useTableData();

  const subColumns = React.useMemo(
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

  const customAction = () => {
    console.log('custom action');
  };

  return (
    <NestedTableContainer>
      <Table columns={subColumns} data={data} loading={loading}>
        <CustomHeader />
        <NestedTableBody />
      </Table>
      <StyledDiv>
        <Typography variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </Typography>
        <Button onClick={customAction}>Save and Submit</Button>
      </StyledDiv>
    </NestedTableContainer>
  );
};

export const nestedTable = () => {
  const { loading, data } = useTableData();

  return (
    <Container>
      <FullTable columns={columns} data={data} loading={loading} SubComponent={SubComponent} />
    </Container>
  );
};

// export const cardTable = () => (
//   <Container>
//     <Card variant="outlined">
//       <CardContent>
//         <Typography variant="h6" color="primary" gutterBottom>
//           Total cases from previous week
//         </Typography>
//         <CardTable />
//       </CardContent>
//     </Card>
//   </Container>
// );
