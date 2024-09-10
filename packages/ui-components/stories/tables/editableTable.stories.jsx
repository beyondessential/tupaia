/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import * as COLORS from '.../helpers/theme/colors';
import { useTableData } from '../../helpers/useTableData';
import {
  Button,
  GreyOutlinedButton,
  EditableTableProvider,
  EditableTable,
  LoadingContainer,
} from '../../src/components';

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

const TABLE_STATUSES = {
  STATIC: 'static',
  EDITABLE: 'editable',
  LOADING: 'loading',
  SAVING: 'saving',
};

const SubmitButton = ({ setTableStatus }) => {
  const handleSubmit = async () => {
    setTableStatus(TABLE_STATUSES.SAVING);
    await sleep(1000);
    setTableStatus(TABLE_STATUSES.STATIC);
  };
  return <Button onClick={handleSubmit}>Save</Button>;
};

SubmitButton.propTypes = {
  setTableStatus: PropTypes.func.isRequired,
};

export const editableTable = () => {
  const [tableStatus, setTableStatus] = useState(TABLE_STATUSES.STATIC);
  const { loading, data } = useTableData();

  const handleEditClick = () => {
    setTableStatus(TABLE_STATUSES.EDITABLE);
  };

  const handleCancel = () => {
    setTableStatus(TABLE_STATUSES.STATIC);
  };

  return (
    <Container>
      <EditableTableProvider columns={columns} data={data} tableStatus={tableStatus}>
        <LoadingContainer isLoading={tableStatus === TABLE_STATUSES.SAVING}>
          <LayoutRow>
            <Typography variant="h6">Editable Table</Typography>
            <GreyOutlinedButton
              onClick={handleEditClick}
              disabled={tableStatus === TABLE_STATUSES.EDITABLE}
            >
              Edit
            </GreyOutlinedButton>
          </LayoutRow>
          <EditableTable isLoading={loading} />
          {tableStatus === TABLE_STATUSES.EDITABLE && (
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
        </LoadingContainer>
      </EditableTableProvider>
    </Container>
  );
};
