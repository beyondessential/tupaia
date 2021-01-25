/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import MuiLink from '@material-ui/core/Link';
import styled from 'styled-components';
import {
  LoadingContainer,
  TableBody,
  GreyOutlinedButton,
  Button,
  TextField,
  FakeHeader,
  SmallAlert,
  Table,
} from '@tupaia/ui-components';
import {
  FlexStart,
  FlexSpaceBetween,
  FlexEnd,
  PercentageChangeCell,
  BorderlessTableRow,
} from '../../components';
import { VerifiableTableRow } from './VerifiableTableRow';
import { useSaveCountryReport } from '../../api';
import { EditableCell, EditableTableContext } from '../../components/EditableTable';
import { TABLE_STATUSES } from '../../constants';

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

export const CountryReportTable = React.memo(
  ({ isFetching, data, fetchError, sitesReported, totalSites, weekNumber }) => {
    const { tableStatus, setTableStatus } = useContext(EditableTableContext);
    const { countryCode } = useParams();

    const { handleSubmit, ...methods } = useForm();

    const [saveReport, { error, isError }] = useSaveCountryReport(countryCode, weekNumber);

    const onSubmit = async formData => {
      setTableStatus(TABLE_STATUSES.SAVING);

      try {
        await saveReport({
          afr: parseInt(formData.AFR),
          dia: parseInt(formData.DIA),
          ili: parseInt(formData.ILI),
          pf: parseInt(formData.PF),
          dli: parseInt(formData.DLI),
          sitesReported: parseInt(formData.sitesReported),
          sites: parseInt(formData.totalSites),
        });
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
            <FlexSpaceBetween pb={2}>
              {tableStatus === TABLE_STATUSES.EDITABLE ? (
                <FormRow>
                  <ReportedSites variant="h6">Reported Sites:</ReportedSites>
                  <StyledTextField
                    defaultValue={sitesReported}
                    error={!!methods.errors.sitesReported}
                    name="sitesReported"
                    inputRef={methods.register({
                      required: 'Required',
                    })}
                  />
                  <ReportedSites variant="h5"> / Total Sites: </ReportedSites>
                  <StyledTextField
                    defaultValue={totalSites}
                    error={!!methods.errors.totalSites}
                    name="totalSites"
                    inputRef={methods.register({
                      required: 'Required',
                    })}
                  />
                </FormRow>
              ) : (
                <Typography variant="h5">
                  {sitesReported}/{totalSites} Sites Reported
                </Typography>
              )}
              <GreyOutlinedButton
                onClick={handleEdit}
                type="button"
                disabled={tableStatus === TABLE_STATUSES.EDITABLE}
              >
                Edit
              </GreyOutlinedButton>
            </FlexSpaceBetween>
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
              <FlexEnd pt={3} mt={3} borderTop={1} borderColor="grey.400">
                {/*<MuiLink underline="always">Reset and use Sentinel data</MuiLink>*/}
                <div>
                  <Button variant="outlined" type="button" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </FlexEnd>
            )}
          </form>
        </FormProvider>
      </LoadingContainer>
    );
  },
);

CountryReportTable.propTypes = {
  isFetching: PropTypes.bool,
  data: PropTypes.array.isRequired,
  fetchError: PropTypes.array,
  sitesReported: PropTypes.number.isRequired,
  weekNumber: PropTypes.string.isRequired,
  totalSites: PropTypes.number.isRequired,
};

CountryReportTable.defaultProps = {
  isFetching: false,
  fetchError: null,
};
