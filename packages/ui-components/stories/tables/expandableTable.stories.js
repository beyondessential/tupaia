/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import MuiTableBody from '@material-ui/core/TableBody';
import {
  Button,
  Table,
  ExpandableTable,
  ExpandableTableRow,
  FakeHeader,
  CondensedTableBody,
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
      <ExpandableTable
        columns={columns}
        data={data}
        loading={loading}
        SubComponent={SubComponent}
      />
    </Container>
  );
};

const TableBody = ({ ...props }) => {
  return (
    <MuiTableBody>
      {props.data.map((rowData, rowIndex) => {
        const expanded = rowIndex === 0;

        const handleRowClick = () => {
          console.log('click...');
        };

        return (
          <ExpandableTableRow
            onClick={handleRowClick}
            expanded={expanded}
            rowIndex={rowIndex}
            key={rowData.id}
            {...props}
          />
        );
      })}
    </MuiTableBody>
  );
};

TableBody.propTypes = {
  data: PropTypes.array.isRequired,
};

export const controlledExpandableTable = () => {
  const { loading, data } = useTableData();

  return (
    <Container>
      <ExpandableTable
        columns={columns}
        data={data}
        loading={loading}
        Body={TableBody}
        SubComponent={SubComponent}
      />
    </Container>
  );
};
