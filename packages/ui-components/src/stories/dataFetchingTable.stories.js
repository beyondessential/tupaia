/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Alarm } from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';
import { DataFetchingTable } from '../components/DataFetchingTable';
import { Button } from '../components/Button';

export default {
  title: 'DataFetchingTable',
};

const Container = styled.div`
  max-width: 1000px;
  margin: 1rem;
`;

const getDisplayName = ({ name }) => (
  <React.Fragment>
    {name} <Alarm />
  </React.Fragment>
);

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
`;

const StyledSpan = styled.span`
  display: flex;
  align-items: center;
`;

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

  const NestedTable = () => {
    const customAction = () => {
      console.log('custom action');
    };

    return (
      <React.Fragment>
        <DataFetchingTable endpoint="users" columns={columns} />
        <StyledDiv>
          <StyledSpan>
            <Alarm />
            <Typography variant="body1">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            </Typography>
          </StyledSpan>
          <Button onClick={customAction}>Save and Submit</Button>
        </StyledDiv>
      </React.Fragment>
    );
  };

  return (
    <Container>
      <DataFetchingTable endpoint="users" columns={columns} SubComponent={NestedTable} />
    </Container>
  );
};
