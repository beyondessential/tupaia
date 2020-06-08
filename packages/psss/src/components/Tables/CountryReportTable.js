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
  const { tableStatus } = useContext(EditableTableContext);
  const Row = tableStatus === 'editable' ? BorderlessTableRow : VerifiableTableRow;
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

const TABLE_STATUSES = {
  STATIC: 'static',
  EDITABLE: 'editable',
  SAVING: 'saving',
  LOADING: 'loading',
};

export const CountryReportTableComponent = ({ tableStatus, setTableStatus, onSubmit }) => {
  const { fields } = useContext(EditableTableContext);

  const handleEdit = () => {
    setTableStatus(TABLE_STATUSES.EDITABLE);
  };

  const handleCancel = () => {
    setTableStatus(TABLE_STATUSES.STATIC);
  };

  const handleSubmit = async () => {
    setTableStatus(TABLE_STATUSES.SAVING);
    await onSubmit(fields);
    setTableStatus(TABLE_STATUSES.STATIC);
  };

  return (
    <EditableTableLoader isLoading={tableStatus === TABLE_STATUSES.SAVING}>
      <LayoutRow>
        <Typography variant="h5">7/10 Sites Reported</Typography>
        <GreyOutlinedButton onClick={handleEdit} disabled={tableStatus === TABLE_STATUSES.EDITABLE}>
          Edit
        </GreyOutlinedButton>
      </LayoutRow>
      <GreyHeader>
        <span>SYNDROMES</span>
        <span>TOTAL CASES</span>
      </GreyHeader>
      <EditableTable Header={false} Body={VerifiableBody} />
      {tableStatus === TABLE_STATUSES.EDITABLE && (
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
  tableStatus: PropTypes.PropTypes.oneOf([
    TABLE_STATUSES.STATIC,
    TABLE_STATUSES.EDITABLE,
    TABLE_STATUSES.LOADING,
    TABLE_STATUSES.SAVING,
  ]).isRequired,
  setTableStatus: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onSubmit: data => dispatch(updateWeeklyReportsData(data)),
});

export const CountryReportTable = connect(null, mapDispatchToProps)(CountryReportTableComponent);
