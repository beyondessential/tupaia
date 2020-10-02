/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiLink from '@material-ui/core/Link';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import { DataFetchingTable, CondensedTableBody, FakeHeader, ExpandableTableBody } from '../../src';
import { AFRCell, SitesReportedCell } from '../story-utils/TableCells';
import * as COLORS from '../story-utils/theme/colors';
import { connectApi } from '../story-utils/api';

export default {
  title: 'Tables/DataFetchingTable',
  component: DataFetchingTable,
};

const Container = styled.div`
  width: 100%;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY};

  > div {
    max-width: 900px;
    margin: 0 auto;
  }
`;

/*
 * CountrySummaryTable
 */
const CountryWeekTitle = styled.div`
  color: ${COLORS.TEXT_DARKGREY};
  font-size: 15px;
  line-height: 1;
`;

const CountryWeekNameCell = React.memo(({ week, startDate, endDate }) => {
  const start = `${format(startDate, 'LLL d')}`;
  const end = `${format(endDate, 'LLL d')}`;
  const year = `${format(endDate, 'yyyy')}`;
  return (
    <>
      <CountryWeekTitle>
        <strong>W{week}</strong> {`${start} - ${end}, ${year}`}
      </CountryWeekTitle>
    </>
  );
});

CountryWeekNameCell.propTypes = {
  week: PropTypes.number.isRequired,
  startDate: PropTypes.instanceOf(Date).isRequired,
  endDate: PropTypes.instanceOf(Date).isRequired,
};

const CountryTableHeader = () => {
  return <FakeHeader>PREVIOUS 8 WEEKS</FakeHeader>;
};

const countryTableColumns = [
  {
    title: 'Name',
    key: 'name',
    width: '30%',
    align: 'left',
    CellComponent: CountryWeekNameCell,
  },
  {
    title: 'Site Reported',
    key: 'sitesReported',
    CellComponent: SitesReportedCell,
    width: '100px',
  },
  {
    title: 'AFR',
    key: 'AFR',
    CellComponent: AFRCell,
  },
  {
    title: 'DIA',
    key: 'DIA',
  },
  {
    title: 'ILI',
    key: 'ILI',
  },
  {
    title: 'PF',
    key: 'PF',
  },
  {
    title: 'DLI',
    key: 'DLI',
  },
];

function mapApiToDataFetchingTable(api, { endpoint, fetchOptions }) {
  return {
    fetchData: queryParameters => api.get(endpoint, { ...fetchOptions, ...queryParameters }),
  };
}

const ConnectedTable = connectApi(mapApiToDataFetchingTable)(DataFetchingTable);

/*
 * CountryTable Component
 */
const CountryTable = React.memo(props => (
  <>
    <CountryTableHeader />
    <ConnectedTable
      endpoint="country-weeks"
      fetchOptions={{ filterId: props }}
      columns={countryTableColumns}
      Header={false}
      Body={CondensedTableBody}
    />
  </>
));

/*
 * CountryTable
 */
const CountryTitle = styled(MuiLink)`
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 1.125rem;
  color: ${COLORS.BLUE};

  .MuiAvatar-root {
    margin-right: 0.6rem;
    color: ${COLORS.GREY_DE};
    background-color: ${COLORS.GREY_DE};
  }
`;

const CountryNameCell = React.memo(({ name }) => {
  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();
    console.log('route to country page');
  };

  return (
    <CountryTitle href="#" onClick={handleClick}>
      <Avatar /> {name}
    </CountryTitle>
  );
});

CountryNameCell.propTypes = {
  name: PropTypes.string.isRequired,
};

const countriesTableColumns = [
  {
    title: 'Name',
    key: 'name',
    width: '30%',
    align: 'left',
    CellComponent: CountryNameCell,
  },
  {
    title: 'Site Reported',
    key: 'sitesReported',
    CellComponent: SitesReportedCell,
    width: '100px',
  },
  {
    title: 'AFR',
    key: 'AFR',
    CellComponent: AFRCell,
  },
  {
    title: 'DIA',
    key: 'DIA',
  },
  {
    title: 'ILI',
    key: 'ILI',
  },
  {
    title: 'PF',
    key: 'PF',
  },
  {
    title: 'DLI',
    key: 'DLI',
  },
];

/*
 * CountriesTable Component
 */
export const CountriesTable = () => {
  return (
    <Container>
      <ConnectedTable
        endpoint="countries"
        columns={countriesTableColumns}
        Body={ExpandableTableBody}
        SubComponent={CountryTable}
      />
    </Container>
  );
};
