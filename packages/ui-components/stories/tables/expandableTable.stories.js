/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import {
  WarningButton,
  Button,
  Table,
  FakeHeader,
  CondensedTableBody,
  ExpandableTableBody,
  ControlledExpandableTableRow,
} from '../../src';
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

const ButtonContainer = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 3px;
`;

const TableRow = props => {
  const { data, rowIndex } = props;
  const nameFirstLetter = data[rowIndex].name.charAt(0);
  const initialValue = nameFirstLetter === 'A';
  const [expanded, setExpanded] = useState(initialValue);

  const WarningAction = () => {
    const handelClick = () => {
      setExpanded(false);
    };

    return (
      <ButtonContainer>
        <WarningButton onClick={handelClick}>Please Verify Now</WarningButton>
      </ButtonContainer>
    );
  };
  return (
    <ControlledExpandableTableRow {...props} expanded={expanded} SubComponent={WarningAction} />
  );
};

const TableBody = props => <ExpandableTableBody TableRow={TableRow} {...props} />;

export const controlledExpandableTable = () => {
  const { loading, data } = useTableData();
  return <Table Header={false} Body={TableBody} columns={columns} data={data} />;
};
