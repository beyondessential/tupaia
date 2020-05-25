/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Button, Table, FakeHeader, CondensedTableBody } from '../../src';
import { useTableData } from '../story-utils/useTableData';
import * as COLORS from '../story-utils/theme/colors';

export default {
  title: 'Tables/ExpandableTable',
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

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
`;

const SubComponent = React.memo(() => {
  const { loading, data } = useTableData();

  const subColumns = React.useMemo(
    () => [
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
    ],
    [],
  );

  const customAction = () => {
    console.log('custom action');
  };

  return (
    <React.Fragment>
      <FakeHeader>10/30 Sentinel Sites Reported</FakeHeader>
      <Table
        columns={subColumns}
        data={data}
        Header={false}
        Body={CondensedTableBody}
        loading={loading}
      />
      <StyledDiv>
        <Typography variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </Typography>
        <Button onClick={customAction}>Save and Submit</Button>
      </StyledDiv>
    </React.Fragment>
  );
});

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

export const expandableTable = () => {
  const { loading, data } = useTableData();

  return (
    <Container>
      <Table columns={columns} data={data} loading={loading} SubComponent={SubComponent} />
    </Container>
  );
};
