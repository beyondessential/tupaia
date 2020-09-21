/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/Info';
import MuiLink from '@material-ui/core/Link';
import styled from 'styled-components';
import {
  EditableTable,
  EditableTableContext,
  LoadingContainer,
  TableBody,
  GreyOutlinedButton,
  Button,
  TextField,
  FakeHeader,
  SmallAlert,
} from '@tupaia/ui-components';
import { FlexStart, BorderlessTableRow, FlexSpaceBetween } from '../../components';
import { VerifiableTableRow } from './VerifiableTableRow';
import { updateWeeklyReportsData } from '../../store';

const VerifiableBody = props => {
  const { tableStatus } = useContext(EditableTableContext);
  const Row = tableStatus === 'editable' ? BorderlessTableRow : VerifiableTableRow;
  return <TableBody TableRow={Row} {...props} />;
};

const FormRow = styled(FlexStart)`
  flex: 1;
  padding-left: 1rem;
`;

const GreyHeader = styled(FakeHeader)`
  border: none;
`;

const Alert = styled(SmallAlert)`
  margin-bottom: 1.2rem;
`;

const GreyAlert = styled(SmallAlert)`
  background: ${props => props.theme.palette.text.secondary};
  font-weight: 500;
  color: white;
  margin-bottom: 1.2rem;
`;

const ReportedSites = styled(Typography)`
  font-size: 1.125rem;
  line-height: 1.3rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.primary};
`;

const StyledTextField = styled(TextField)`
  width: 2.4rem;
  margin: 0 0.6rem;

  .MuiInputBase-input {
    font-size: 15px;
    line-height: 18px;
    padding: 0.5rem 0;
    text-align: center;
  }
`;

const TABLE_STATUSES = {
  STATIC: 'static',
  EDITABLE: 'editable',
  SAVING: 'saving',
  LOADING: 'loading',
};

export const CountryReportTableComponent = React.memo(
  ({ tableStatus, setTableStatus, onSubmit, sitesReported, totalSites }) => {
    const { fields } = useContext(EditableTableContext);
    const [sitesReportedValue, setSitesReportedValue] = useState(sitesReported);

    const handleEdit = useCallback(() => {
      setTableStatus(TABLE_STATUSES.EDITABLE);
    }, [setTableStatus]);

    const handleCancel = useCallback(() => {
      setTableStatus(TABLE_STATUSES.STATIC);
    }, [setTableStatus]);

    const handleSubmit = async () => {
      setTableStatus(TABLE_STATUSES.SAVING);
      await onSubmit({
        ...fields,
        sitesReported: parseInt(sitesReportedValue, 10),
      });
      setTableStatus(TABLE_STATUSES.STATIC);
    };

    return (
      <LoadingContainer isLoading={tableStatus === TABLE_STATUSES.SAVING}>
        <FlexSpaceBetween pb={2}>
          {tableStatus === TABLE_STATUSES.EDITABLE ? (
            <FormRow>
              <ReportedSites variant="h6">Reported Sites:</ReportedSites>
              <StyledTextField
                value={sitesReportedValue}
                onChange={event => setSitesReportedValue(event.target.value)}
                name="sites-reported"
              />
              <ReportedSites variant="h6"> / Total Sites: {totalSites}</ReportedSites>
            </FormRow>
          ) : (
            <Typography variant="h5">
              {sitesReportedValue}/{totalSites} Sites Reported
            </Typography>
          )}
          <GreyOutlinedButton
            onClick={handleEdit}
            disabled={tableStatus === TABLE_STATUSES.EDITABLE}
          >
            Edit
          </GreyOutlinedButton>
        </FlexSpaceBetween>
        {tableStatus === TABLE_STATUSES.EDITABLE ? (
          <Alert severity="error" variant="standard">
            Updating country level data manually: all individual sentinel site data will be ignored
          </Alert>
        ) : (
          <GreyAlert severity="info" icon={<InfoIcon fontSize="inherit" />}>
            Country level data has been manually edited, sentinel data will not be used.
          </GreyAlert>
        )}
        <GreyHeader>
          <span>SYNDROMES</span>
          <span>TOTAL CASES</span>
        </GreyHeader>
        <EditableTable Header={false} Body={VerifiableBody} />
        {tableStatus === TABLE_STATUSES.EDITABLE && (
          <FlexSpaceBetween pt={3}>
            <MuiLink>Reset and use Sentinel data</MuiLink>
            <div>
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save</Button>
            </div>
          </FlexSpaceBetween>
        )}
      </LoadingContainer>
    );
  },
);

CountryReportTableComponent.propTypes = {
  tableStatus: PropTypes.PropTypes.oneOf([
    TABLE_STATUSES.STATIC,
    TABLE_STATUSES.EDITABLE,
    TABLE_STATUSES.LOADING,
    TABLE_STATUSES.SAVING,
  ]).isRequired,
  setTableStatus: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  sitesReported: PropTypes.number.isRequired,
  totalSites: PropTypes.number.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onSubmit: data => dispatch(updateWeeklyReportsData(data)),
});

export const CountryReportTable = connect(null, mapDispatchToProps)(CountryReportTableComponent);
