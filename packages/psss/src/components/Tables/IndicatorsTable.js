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

const LayoutRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
`;

const StyledEditableTable = styled(EditableTable)`
  padding-left: 1.2rem;
  padding-right: 1.2rem;
`;

const STATIC = 'static';
const EDITABLE = 'editable';
const SAVING = 'saving';
const LOADING = 'loading';

export const IndicatorsTableComponent = ({ onSubmit, tableState, setTableState }) => {
  const { fields } = useContext(EditableTableContext);

  const handleEdit = () => {
    setTableState(EDITABLE);
  };

  const handleCancel = () => {
    setTableState(STATIC);
  };

  const handleSubmit = async () => {
    setTableState(SAVING);
    await onSubmit(fields);
    setTableState(STATIC);
  };

  return (
    <EditableTableLoader isLoading={tableState === SAVING}>
      <HeadingRow>
        <HeaderTitle>Sentinel Cases Reported</HeaderTitle>
        <GreyOutlinedButton onClick={handleEdit} disabled={tableState === EDITABLE}>
          Edit
        </GreyOutlinedButton>
      </HeadingRow>
      <FakeHeader>
        <span>SYNDROMES</span>
        <span>TOTAL CASES</span>
      </FakeHeader>
      <StyledEditableTable Header={false} Body={DottedTableBody} />
      {tableState === EDITABLE && (
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

IndicatorsTableComponent.propTypes = {
  tableState: PropTypes.PropTypes.oneOf([STATIC, EDITABLE, LOADING, SAVING]).isRequired,
  setTableState: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onSubmit: data => dispatch(updateWeeklyReportsData(data)),
});

export const IndicatorsTable = connect(null, mapDispatchToProps)(IndicatorsTableComponent);
