/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiLink from '@material-ui/core/Link';
import * as COLORS from '../story-utils/theme/colors';
import { useTableData } from '../story-utils/useTableData';
import {
  Button,
  Table,
  EditableTable,
  EditableTableAction,
  EditableTableProvider,
} from '../../src';

export default {
  title: 'Tables/EditableTable',
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

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
`;

const Loader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3rem 0;
  text-align: center;
`;

const editableTableColumns = [
  {
    title: 'Name',
    key: 'name',
    editable: true,
  },
  {
    title: 'Surname',
    key: 'surname',
    editable: true,
  },
  {
    title: 'Email',
    key: 'email',
    editable: true,
  },
];

export const editableTable = () => {
  const { loading, data } = useTableData();
  const [tableState, setTableState] = useState('static');
  const tableData = data.slice(0, 10);

  const handleEditClick = () => {
    setTableState('editable');
  };

  const SubmitButton = ({ fields }) => {
    const handleSubmit = () => {
      console.log('updated values...', fields);
      setTableState('static');
    };

    return <Button onClick={handleSubmit}>Save</Button>;
  };

  SubmitButton.propTypes = {
    fields: PropTypes.any.isRequired,
  };

  const CancelButton = () => {
    const handleCancel = () => {
      setTableState('static');
    };
    return (
      <Button variant="outlined" onClick={handleCancel}>
        Cancel
      </Button>
    );
  };

  return (
    <Container>
      <Button fullWidth onClick={handleEditClick} disabled={tableState === 'editable'}>
        Edit
      </Button>
      {loading ? (
        <Loader>Loading...</Loader>
      ) : (
        <EditableTableProvider
          columns={editableTableColumns}
          data={tableData}
          tableState={tableState}
        >
          <EditableTable Component={Table} />
          {tableState === 'editable' && (
            <ActionsRow>
              <MuiLink>Reset and use Sentinel data</MuiLink>
              <div>
                <EditableTableAction Component={CancelButton} />
                <EditableTableAction Component={SubmitButton} />
              </div>
            </ActionsRow>
          )}
        </EditableTableProvider>
      )}
    </Container>
  );
};
