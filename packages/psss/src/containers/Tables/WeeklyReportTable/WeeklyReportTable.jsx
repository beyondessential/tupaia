import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { LoadingContainer, TableBody, Button, SmallAlert, Table } from '@tupaia/ui-components';
import MuiLink from '@material-ui/core/Link';
import {
  EditableCell,
  EditableTableContext,
  FlexEnd,
  FlexSpaceBetween,
  PercentageChangeCell,
  BorderlessTableRow,
} from '../../../components';
import { VerifiableTableRow } from './VerifiableTableRow';
import { combineMutationResults, useDeleteWeeklyReport, useSaveWeeklyReport } from '../../../api';
import { TABLE_STATUSES } from '../../../constants';
import { WeeklyReportTableHeading } from './WeeklyReportTableHeading';

const Alert = styled(SmallAlert)`
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
    <FlexEnd p={2}>{children}</FlexEnd>
  ) : (
    <FlexSpaceBetween pl={3} pt={3} mt={3} borderTop={1} borderColor="grey.400">
      {children}
    </FlexSpaceBetween>
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
    const { mutate: saveReport, ...saveResults } = useSaveWeeklyReport({
      countryCode,
      siteCode,
      week: weekNumber,
    });
    const { mutate: deleteReport, ...deleteResults } = useDeleteWeeklyReport({
      countryCode,
      week: weekNumber,
    });
    const { error, isError } = combineMutationResults([saveResults, deleteResults]);
    const isCountryTableBeingEdited =
      !isSiteReport && [TABLE_STATUSES.EDITABLE, TABLE_STATUSES.SAVING].includes(tableStatus);

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

    const handleReset = async () => {
      setTableStatus(TABLE_STATUSES.SAVING);

      try {
        await deleteReport();
        setTableStatus(TABLE_STATUSES.STATIC);
      } catch (e) {
        setTableStatus(TABLE_STATUSES.ERROR);
      }
    };

    return (
      <LoadingContainer
        isLoading={isFetching || tableStatus === TABLE_STATUSES.SAVING}
        heading={isFetching ? 'Loading data' : 'Saving Data'}
        errorMessage={fetchError}
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <WeeklyReportTableHeading
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
            {isCountryTableBeingEdited && (
              <Alert severity="error" variant="standard">
                Updating aggregated data will be the source of truth. All individual Sentinel data
                will be ignored.
              </Alert>
            )}
            <Table Header={TableHeader} Body={VerifiableBody} data={data} columns={columns} />
            {tableStatus === TABLE_STATUSES.EDITABLE && (
              <ActionsRow isSiteReport={isSiteReport}>
                {!isSiteReport && (
                  <MuiLink
                    component="button"
                    variant="body2"
                    underline="always"
                    onClick={handleReset}
                  >
                    Reset and use Sentinel data
                  </MuiLink>
                )}
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
