/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useContext, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
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
import { FlexStart, BorderlessTableRow, FlexSpaceBetween, FlexEnd } from '../../components';
import { VerifiableTableRow } from './VerifiableTableRow';
import { useSaveCountryReport } from '../../api';

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
  ERROR: 'error',
};

export const CountryReportTable = React.memo(
  ({ isFetching, tableStatus, setTableStatus, sitesReported, totalSites, weekNumber }) => {
    const { fields } = useContext(EditableTableContext);
    const [sitesReportedValue, setSitesReportedValue] = useState(sitesReported);
    const [totalSitesValue, setTotalSitesValue] = useState(totalSites);
    const { countryCode } = useParams();

    useEffect(() => {
      setSitesReportedValue(sitesReported);
      setTotalSitesValue(totalSites);
    }, [sitesReported, totalSites]);

    const [saveReport] = useSaveCountryReport(countryCode, weekNumber);

    const handleSubmit = async () => {
      setTableStatus(TABLE_STATUSES.SAVING);

      try {
        await saveReport({
          afr: parseInt(fields['AFR-totalCases']),
          dia: parseInt(fields['DIA-totalCases']),
          ili: parseInt(fields['ILI-totalCases']),
          pf: parseInt(fields['PF-totalCases']),
          dli: parseInt(fields['DLI-totalCases']),
          sitesReported: parseInt(sitesReportedValue),
          sites: parseInt(totalSitesValue),
        });
        setTableStatus(TABLE_STATUSES.STATIC);
      } catch (error) {
        setTableStatus(TABLE_STATUSES.ERROR);
      }
    };

    const handleEdit = useCallback(() => {
      setTableStatus(TABLE_STATUSES.EDITABLE);
    }, [setTableStatus]);

    const handleCancel = useCallback(() => {
      setTableStatus(TABLE_STATUSES.STATIC);
    }, [setTableStatus]);

    if (Object.keys(fields).length === 0) {
      return null;
    }

    return (
      <LoadingContainer
        isLoading={isFetching || tableStatus === TABLE_STATUSES.SAVING}
        heading={isFetching ? 'Loading data' : 'Saving Data'}
      >
        <FlexSpaceBetween pb={2}>
          {tableStatus === TABLE_STATUSES.EDITABLE ? (
            <FormRow>
              <ReportedSites variant="h6">Reported Sites:</ReportedSites>
              <StyledTextField
                value={sitesReportedValue}
                onChange={event => setSitesReportedValue(event.target.value)}
                name="sites-reported"
              />
              <ReportedSites variant="h5"> / Total Sites: </ReportedSites>
              <StyledTextField
                value={totalSitesValue}
                onChange={event => setTotalSitesValue(event.target.value)}
                name="total-sites"
              />
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
        {/*ToDo: implement with sentinel sites feature*/}
        {/*@see https://app.zenhub.com/workspaces/sprint-board-5eea9d3de8519e0019186490/issues/beyondessential/tupaia-backlog/1640*/}
        {/*{tableStatus === TABLE_STATUSES.EDITABLE && (*/}
        {/*  <Alert severity="error" variant="standard">*/}
        {/*    Updating country level data manually: all individual sentinel site data will be ignored*/}
        {/*  </Alert>*/}
        {/*)}*/}
        {/*<GreyAlert severity="info" icon={<InfoIcon fontSize="inherit" />}>*/}
        {/*Country level data has been manually edited, sentinel data will not be used.*/}
        {/*</GreyAlert>*/}
        <GreyHeader>
          <span>SYNDROMES</span>
          <span>TOTAL CASES</span>
        </GreyHeader>
        <EditableTable Header={false} Body={VerifiableBody} />
        {tableStatus === TABLE_STATUSES.EDITABLE && (
          <FlexEnd pt={3} mt={3} borderTop={1} borderColor="grey.400">
            {/*<MuiLink underline="always">Reset and use Sentinel data</MuiLink>*/}
            <div>
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Save</Button>
            </div>
          </FlexEnd>
        )}
      </LoadingContainer>
    );
  },
);

CountryReportTable.propTypes = {
  isFetching: PropTypes.bool,
  tableStatus: PropTypes.PropTypes.oneOf([
    TABLE_STATUSES.STATIC,
    TABLE_STATUSES.EDITABLE,
    TABLE_STATUSES.SAVING,
  ]).isRequired,
  setTableStatus: PropTypes.func.isRequired,
  sitesReported: PropTypes.number.isRequired,
  weekNumber: PropTypes.string.isRequired,
  totalSites: PropTypes.number.isRequired,
};

CountryReportTable.defaultProps = {
  isFetching: false,
};
