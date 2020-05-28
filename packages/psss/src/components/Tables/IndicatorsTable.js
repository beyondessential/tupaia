/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import MuiLink from '@material-ui/core/Link';
import styled from 'styled-components';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { GreyOutlinedButton, Button, FakeHeader } from '@tupaia/ui-components';
import { DottedTableBody } from './TableBody';
import { EditableTableContext, EditableTable } from './EditableTable';
import { updateWeeklyReportsData } from '../../store';

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

export const IndicatorsTableComponent = ({ onSubmit, tableState, setTableState }) => {
  const { fields } = useContext(EditableTableContext);

  const handleEdit = () => {
    setTableState('editable');
  };

  const handleCancel = () => {
    setTableState('static');
  };

  const handleSubmit = async () => {
    console.log('updated values...', fields);
    await onSubmit(fields);
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
      <EditableTable Header={false} Body={DottedTableBody} />
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

IndicatorsTableComponent.propTypes = {
  tableState: PropTypes.string.isRequired,
  setTableState: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onSubmit: data => dispatch(updateWeeklyReportsData(data)),
});

export const IndicatorsTable = connect(null, mapDispatchToProps)(IndicatorsTableComponent);
