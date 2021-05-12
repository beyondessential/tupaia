/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Table } from '@tupaia/ui-components';
import {
  SyndromeCell,
  AlertMenuCell,
  CountryNameLinkCell,
  WeekAndDateCell,
  StartDateCell,
} from '../../components';
import { useArchivedAlerts } from '../../api';
import { getCountryCodes } from '../../store';

// TODO uncomment the commented out lines in column config after outbreaks are added
// https://github.com/beyondessential/tupaia-backlog/issues/1512
const countryColumn = {
  title: 'Country',
  key: 'countryCode',
  width: '28%',
  // width: '285',
  align: 'left',
  CellComponent: CountryNameLinkCell,
};

const archiveColumns = [
  {
    title: 'Syndrome',
    key: 'syndrome',
    align: 'left',
    // width: '100px',
    CellComponent: SyndromeCell,
  },
  {
    title: 'Alert Start Date',
    key: 'period',
    align: 'left',
    width: '200px',
    // width: '220px',
    CellComponent: WeekAndDateCell,
  },
  {
    title: 'Cases Since Alert Began',
    key: 'totalCases',
    align: 'left',
    width: '115px', // TODO comment out after https://github.com/beyondessential/tupaia-backlog/issues/1512
  },
  // {
  //   title: 'Outbreak Start Date',
  //   key: 'outbreakStartDate',
  //   align: 'left',
  //   CellComponent: StartDateCell,
  // },
  {
    title: 'Diagnosis',
    key: 'diagnosis',
    align: 'left',
  },
  {
    title: '',
    key: 'id',
    sortable: false,
    CellComponent: AlertMenuCell,
    // width: '70px',
    width: '45px',
  },
];

const getColumns = isSingleCountry =>
  isSingleCountry ? archiveColumns : [countryColumn, ...archiveColumns];

const ArchiveTableComponent = React.memo(({ countryCode, countryCodes }) => {
  const isSingleCountry = !!countryCode;
  const orgUnitCodes = isSingleCountry ? [countryCode] : countryCodes;
  const { data, isLoading, error, isFetching } = useArchivedAlerts(orgUnitCodes);
  const columns = getColumns(isSingleCountry);

  return (
    <>
      <Table
        data={data}
        isLoading={isLoading}
        isFetching={!isLoading && isFetching}
        errorMessage={error && error.message}
        columns={columns}
      />
      {isFetching && 'Fetching...'}
    </>
  );
});

ArchiveTableComponent.propTypes = {
  countryCode: PropTypes.string,
  countryCodes: PropTypes.arrayOf(PropTypes.string).isRequired,
};

ArchiveTableComponent.defaultProps = {
  countryCode: '',
};

const mapStateToProps = state => ({
  countryCodes: getCountryCodes(state),
});

export const ArchiveTable = connect(mapStateToProps)(ArchiveTableComponent);
