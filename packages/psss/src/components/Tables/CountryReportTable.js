/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import styled from 'styled-components';
import {
  EditableTable,
  EditableTableContext,
  EditableTableLoader,
  TableBody,
  GreyOutlinedButton,
  Button,
  FakeHeader,
} from '@tupaia/ui-components';
import { VerifiableTableRow } from './VerifiableTableRow';
import { BorderlessTableRow } from './TableRow';
import { updateWeeklyReportsData } from '../../store';

const VerifiableBody = props => {
  const { tableState } = useContext(EditableTableContext);
  const Row = tableState === 'editable' ? BorderlessTableRow : VerifiableTableRow;
  return <TableBody TableRow={Row} {...props} />;
};

const LayoutRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
`;

const GreyHeader = styled(FakeHeader)`
  border: none;
`;

const TABLE_STATES = {
  STATIC: 'static',
  EDITABLE: 'editable',
  SAVING: 'saving',
  LOADING: 'loading',
};

export const CountryReportTableComponent = ({ tableState, setTableState, onSubmit }) => {
  const { fields } = useContext(EditableTableContext);

  const handleEdit = () => {
    setTableState(TABLE_STATES.EDITABLE);
  };

  const handleCancel = () => {
    setTableState(TABLE_STATES.STATIC);
  };

  const handleSubmit = async () => {
    setTableState(TABLE_STATES.SAVING);
    await onSubmit(fields);
    setTableState(TABLE_STATES.STATIC);
  };

  return (
    <EditableTableLoader isLoading={tableState === TABLE_STATES.SAVING}>
      <LayoutRow>
        <Typography variant="h5">7/10 Sites Reported</Typography>
        <GreyOutlinedButton onClick={handleEdit} disabled={tableState === TABLE_STATES.EDITABLE}>
          Edit
        </GreyOutlinedButton>
      </LayoutRow>
      <GreyHeader>
        <span>SYNDROMES</span>
        <span>TOTAL CASES</span>
      </GreyHeader>
      <EditableTable Header={false} Body={VerifiableBody} />
      {tableState === TABLE_STATES.EDITABLE && (
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
    </EditableTableLoader>
  );
};

CountryReportTableComponent.propTypes = {
  tableState: PropTypes.PropTypes.oneOf([
    TABLE_STATES.STATIC,
    TABLE_STATES.EDITABLE,
    TABLE_STATES.LOADING,
    TABLE_STATES.SAVING,
  ]).isRequired,
  setTableState: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onSubmit: data => dispatch(updateWeeklyReportsData(data)),
});

export const CountryReportTable = connect(null, mapDispatchToProps)(CountryReportTableComponent);
