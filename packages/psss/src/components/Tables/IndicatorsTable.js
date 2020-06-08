/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import {
  EditableTableContext,
  EditableTable,
  EditableTableLoader,
  GreyOutlinedButton,
  Button,
  FakeHeader,
} from '@tupaia/ui-components';
import { DottedTableBody } from './TableBody';
import { updateWeeklyReportsData } from '../../store';

const HeadingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1.25rem;
  padding-bottom: 1.25rem;
  margin-left: 1.5rem;
  margin-right: 1.5rem;
`;

const HeaderTitle = styled(Typography)`
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 1rem;
  line-height: 1.2rem;
`;

const ActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem;
`;

const StyledEditableTable = styled(EditableTable)`
  padding-left: 1.2rem;
  padding-right: 1.2rem;
`;

const TABLE_STATES = {
  STATIC: 'static',
  EDITABLE: 'editable',
  SAVING: 'saving',
  LOADING: 'loading',
};

export const IndicatorsTableComponent = ({ onSubmit, tableState, setTableState }) => {
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
      <HeadingRow>
        <HeaderTitle>Sentinel Cases Reported</HeaderTitle>
        <GreyOutlinedButton onClick={handleEdit} disabled={tableState === TABLE_STATES.EDITABLE}>
          Edit
        </GreyOutlinedButton>
      </HeadingRow>
      <FakeHeader>
        <span>SYNDROMES</span>
        <span>TOTAL CASES</span>
      </FakeHeader>
      <StyledEditableTable Header={false} Body={DottedTableBody} />
      {tableState === TABLE_STATES.EDITABLE && (
        <ActionsRow>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </ActionsRow>
      )}
    </EditableTableLoader>
  );
};

IndicatorsTableComponent.propTypes = {
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

export const IndicatorsTable = connect(null, mapDispatchToProps)(IndicatorsTableComponent);
