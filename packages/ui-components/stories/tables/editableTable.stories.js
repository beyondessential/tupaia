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
  Table,
  EditableTableContext,
} from '../../src';
import { FakeAPI } from '../story-utils/api';

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

const SubmitButton = ({ setTableStatus }) => {
  const { fields } = useContext(EditableTableContext);

  const handleSubmit = async () => {
    setTableStatus(SAVING);
    await sleep(1000);
    setTableStatus(STATIC);
  };
  return <Button onClick={handleSubmit}>Save</Button>;
};

SubmitButton.propTypes = {
  setTableStatus: PropTypes.func.isRequired,
};

export const editableTable = () => {
  const [tableStatus, setTableStatus] = useState(STATIC);
  const { loading, data } = useTableData();

  const handleEditClick = () => {
    setTableStatus(EDITABLE);
  };

  const handleCancel = () => {
    setTableStatus(STATIC);
  };

  return (
    <Container>
      <EditableTableProvider columns={columns} data={data} tableStatus={tableStatus}>
        <EditableTableLoader isLoading={tableStatus === SAVING}>
          <LayoutRow>
            <Typography variant="h6">Editable Table</Typography>
            <GreyOutlinedButton onClick={handleEditClick} disabled={tableStatus === EDITABLE}>
              Edit
            </GreyOutlinedButton>
          </LayoutRow>
          <EditableTable isLoading={loading} />
          {tableStatus === EDITABLE && (
            <LayoutRow>
              <MuiLink>Reset and use Sentinel data</MuiLink>
              <div>
                <Button variant="outlined" onClick={handleCancel}>
                  Cancel
                </Button>
                <SubmitButton tableStatus={tableStatus} setTableStatus={setTableStatus} />
              </div>
            </LayoutRow>
          )}
        </EditableTableLoader>
      </EditableTableProvider>
    </Container>
  );
};
