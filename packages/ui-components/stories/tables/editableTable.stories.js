/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import * as COLORS from '../story-utils/theme/colors';
import { useTableData } from '../story-utils/useTableData';
import {
  Button,
  GreyOutlinedButton,
  EditableTableProvider,
  EditableTable,
  EditableTableLoader,
  EditableTableContext,
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

const LayoutRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
`;

const columns = [
  {
    title: 'Name',
    key: 'name',
    align: 'left',
    editable: true,
  },
  {
    title: 'Surname',
    key: 'surname',
    align: 'left',
    editable: true,
  },
  {
    title: 'Email',
    key: 'email',
    align: 'left',
    editable: true,
  },
];

function sleep(delay = 0) {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

const STATIC = 'static';
const EDITABLE = 'editable';
const LOADING = 'loading';
const SAVING = 'saving';

const SubmitButton = ({ setTableState }) => {
  const { fields, metadata } = useContext(EditableTableContext);

  const handleSubmit = async () => {
    console.log('updated values...', fields, metadata);
    setTableState(SAVING);
    await sleep(1000);
    setTableState(STATIC);
  };
  return <Button onClick={handleSubmit}>Save</Button>;
};

SubmitButton.propTypes = {
  setTableState: PropTypes.func.isRequired,
};

export const editableTable = () => {
  const { loading, data } = useTableData();
  const [tableState, setTableState] = useState(LOADING);
  const tableData = data.slice(0, 10);

  useEffect(() => {
    setTableState(loading ? LOADING : STATIC);
  }, [loading]);

  const handleEditClick = () => {
    setTableState(EDITABLE);
  };

  const handleCancel = () => {
    setTableState(STATIC);
  };

  return (
    <Container>
      <EditableTableProvider columns={columns} data={tableData} tableState={tableState}>
        <EditableTableLoader isLoading={tableState === SAVING}>
          <LayoutRow>
            <Typography variant="h6">Editable Table</Typography>
            <GreyOutlinedButton onClick={handleEditClick} disabled={tableState === EDITABLE}>
              Edit
            </GreyOutlinedButton>
          </LayoutRow>
          <EditableTable isLoading={loading} />
          {tableState === EDITABLE && (
            <LayoutRow>
              <MuiLink>Reset and use Sentinel data</MuiLink>
              <div>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <SubmitButton tableState={tableState} setTableState={setTableState} />
              </div>
            </LayoutRow>
          )}
        </EditableTableLoader>
      </EditableTableProvider>
    </Container>
  );
};
