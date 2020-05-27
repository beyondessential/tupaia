/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import MuiLink from '@material-ui/core/Link';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { GreyOutlinedButton, Button, FakeHeader } from '@tupaia/ui-components';
import { DottedTable } from './TableTypes';
import { EditableTableContext } from './EditableTable';

const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  padding-bottom: 20px;
  margin-left: 30px;
  margin-right: 30px;
`;

const HeaderTitle = styled(Typography)`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
`;

const LayoutRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
`;

export const IndicatorsTable = ({ tableState, setTableState }) => {
  const { editableColumns, data, fields, metadata } = useContext(EditableTableContext);

  const handleEdit = () => {
    setTableState('editable');
  };

  const handleCancel = () => {
    setTableState('static');
  };

  const handleSubmit = () => {
    // POST DATA
    console.log('updated values...', fields, metadata);
    setTableState('static');
  };

  return (
    <React.Fragment>
      <HeadingRow>
        <HeaderTitle>Sentinel Cases Reported</HeaderTitle>
        <GreyOutlinedButton onClick={handleEdit} disabled={tableState === 'editable'}>
          Edit
        </GreyOutlinedButton>
      </HeadingRow>
      <FakeHeader>
        <span>SYNDROMES</span>
        <span>TOTAL CASES</span>
      </FakeHeader>
      <DottedTable columns={editableColumns} data={data} />
      {tableState === 'editable' && (
        <LayoutRow>
          <MuiLink>Reset and use Sentinel data</MuiLink>
          <div>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </LayoutRow>
      )}
    </React.Fragment>
  );
};

IndicatorsTable.propTypes = {
  tableState: PropTypes.string.isRequired,
  setTableState: PropTypes.func.isRequired,
};
