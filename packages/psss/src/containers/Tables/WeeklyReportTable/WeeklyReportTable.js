/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  LoadingContainer,
  TableBody,
  Button,
  FakeHeader,
  SmallAlert,
  Table,
} from '@tupaia/ui-components';
import {
  EditableCell,
  EditableTableContext,
  FlexEnd,
  PercentageChangeCell,
  BorderlessTableRow,
} from '../../../components';
import { VerifiableTableRow } from './VerifiableTableRow';
import { useSaveWeeklyReport } from '../../../api';
import { TABLE_STATUSES } from '../../../constants';
import { WeeklyReportTableHeading } from './WeeklyReportTableHeading';

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

const StyledTh = styled.th`
  background: #f1f1f1;
  font-size: 11px;
  font-weight: 500;
  line-height: 13px;
  text-align: left;
  color: ${props => props.theme.palette.text.secondary};
  padding: 11px 20px;
`;

const SiteActionsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem;
`;

const TableHeader = () => (
  <thead>
    <tr>
      <StyledTh>SYNDROMES</StyledTh>
      <StyledTh style={{ width: 80 }} />
      <StyledTh style={{ width: 80, padding: 0 }}>TOTAL CASES</StyledTh>
    </tr>
  </thead>
);

const VerifiableBody = props => {
  const { tableStatus } = useContext(EditableTableContext);
  const Row = tableStatus === 'editable' ? BorderlessTableRow : VerifiableTableRow;
  return <TableBody TableRow={Row} {...props} />;
};

/* eslint-disable react/prop-types */
const ActionsRow = ({ children, isSiteReport }) =>
  isSiteReport ? (
    <SiteActionsRow>{children}</SiteActionsRow>
  ) : (
    <FlexEnd pt={3} mt={3} borderTop={1} borderColor="grey.400">
      {children}
    </FlexEnd>
  );
/* eslint-enable react/prop-types */

const columns = [
  {
    title: 'Syndromes',
    key: 'title',
    sortable: false,
  },
  {
    title: '',
    key: 'percentageChange',
    CellComponent: PercentageChangeCell,
    sortable: false,
    width: '80px',
  },
  {
    title: 'Total Cases',
    key: 'totalCases',
    CellComponent: EditableCell,
    sortable: false,
    width: '80px',
  },
];

export const WeeklyReportTable = React.memo(
  ({
    isFetching,
    data,
    fetchError,
    sitesReported,
    totalSites,
    isSiteReport,
    siteCode,
    weekNumber,
  }) => {
    const { tableStatus, setTableStatus } = useContext(EditableTableContext);
    const { countryCode } = useParams();
    const { handleSubmit, ...methods } = useForm();
    const [saveReport, { error, isError }] = useSaveWeeklyReport({
      countryCode,
      siteCode,
      week: weekNumber,
    });

    const onSubmit = async formData => {
      setTableStatus(TABLE_STATUSES.SAVING);

      try {
        const reportData = {
          afr: parseInt(formData.AFR),
          dia: parseInt(formData.DIA),
          ili: parseInt(formData.ILI),
          pf: parseInt(formData.PF),
          dli: parseInt(formData.DLI),
        };
        if (!isSiteReport) {
          reportData.sitesReported = parseInt(formData.sitesReported);
          reportData.sites = parseInt(formData.totalSites);
        }

        await saveReport(reportData);
        setTableStatus(TABLE_STATUSES.STATIC);
      } catch (e) {
        setTableStatus(TABLE_STATUSES.ERROR);
      }
    };

    const handleEdit = useCallback(() => {
      setTableStatus(TABLE_STATUSES.EDITABLE);
    }, [setTableStatus]);

    const handleCancel = useCallback(() => {
      setTableStatus(TABLE_STATUSES.STATIC);
    }, [setTableStatus]);

    return (
      <LoadingContainer
        isLoading={isFetching || tableStatus === TABLE_STATUSES.SAVING}
        heading={isFetching ? 'Loading data' : 'Saving Data'}
        errorMessage={fetchError}
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <WeeklyReportTableHeading
              tableStatus={tableStatus}
              methods={methods}
              sitesReported={sitesReported}
              totalSites={totalSites}
              isSiteReport={!!isSiteReport}
              siteCode={siteCode}
              onEdit={handleEdit}
            />
            {isError && error && (
              <Alert severity="error" variant="standard">
                {error.message}
              </Alert>
            )}
            {/*<GreyAlert severity="info" icon={<InfoIcon fontSize="inherit" />}>*/}
            {/*Country level data has been manually edited, sentinel data will not be used.*/}
            {/*</GreyAlert>*/}
            {/*<GreyHeader>*/}
            {/*  <span>SYNDROMES</span>*/}
            {/*  <span>TOTAL CASES</span>*/}
            {/*</GreyHeader>*/}
            <Table Header={TableHeader} Body={VerifiableBody} data={data} columns={columns} />
            {tableStatus === TABLE_STATUSES.EDITABLE && (
              <ActionsRow isSiteReport={isSiteReport}>
                {/*<MuiLink underline="always">Reset and use Sentinel data</MuiLink>*/}
                <div>
                  <Button variant="outlined" type="button" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </ActionsRow>
            )}
          </form>
        </FormProvider>
      </LoadingContainer>
    );
  },
);

WeeklyReportTable.propTypes = {
  isFetching: PropTypes.bool,
  data: PropTypes.array.isRequired,
  fetchError: PropTypes.string,
  sitesReported: PropTypes.number,
  totalSites: PropTypes.number,
  isSiteReport: PropTypes.bool,
  siteCode: PropTypes.string,
  weekNumber: PropTypes.string.isRequired,
};

WeeklyReportTable.defaultProps = {
  isFetching: false,
  fetchError: null,
  sitesReported: undefined,
  totalSites: undefined,
  isSiteReport: false,
  siteCode: '',
};
