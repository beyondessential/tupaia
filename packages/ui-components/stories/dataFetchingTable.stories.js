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
import { DumbDataFetchingTable, DataFetchingTable } from '../src/components/DataFetchingTable';
import { CondensedTableBody, FakeHeader } from '../src/components/Table';
import { AFRAccessor, SitesReportedAccessor } from '../src/components/TableColumnAccessors';
import * as COLORS from './story-utils/theme/colors';
import { connectApi } from './story-utils/api';

export default {
  title: 'DataFetchingTable',
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

const CountryWeekNameAccessor = ({ week, startDate, endDate }) => {
  const start = `${format(startDate, 'LLL d')}`;
  const end = `${format(endDate, 'LLL d')}`;
  const year = `${format(endDate, 'yyyy')}`;
  return (
    <React.Fragment>
      <CountryWeekTitle>
        <strong>W{week}</strong> {`${start} - ${end}, ${year}`}
      </CountryWeekTitle>
    </React.Fragment>
  );
};

CountryWeekNameAccessor.propTypes = {
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
    accessor: CountryWeekNameAccessor,
  },
  {
    title: 'Site Reported',
    key: 'sitesReported',
    accessor: SitesReportedAccessor,
    width: '100px',
  },
  {
    title: 'AFR',
    key: 'AFR',
    accessor: AFRAccessor,
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
 * CountryTable Component
 */
const CountryTable = props => (
  <React.Fragment>
    <CountryTableHeader />
    <DataFetchingTable
      endpoint="country-weeks"
      fetchOptions={{ filterId: props.rowData.uid }}
      columns={countryTableColumns}
      Header={false}
      Body={CondensedTableBody}
    />
  </React.Fragment>
);

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

const CountryNameAccessor = ({ name }) => {
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
};

CountryNameAccessor.propTypes = {
  name: PropTypes.string.isRequired,
};

const countriesTableColumns = [
  {
    title: 'Name',
    key: 'name',
    width: '30%',
    align: 'left',
    accessor: CountryNameAccessor,
  },
  {
    title: 'Site Reported',
    key: 'sitesReported',
    accessor: SitesReportedAccessor,
    width: '100px',
  },
  {
    title: 'AFR',
    key: 'AFR',
    accessor: AFRAccessor,
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
 * CountryTable Component
 */
export const CountriesTable = () => {
  return (
    <Container>
      <DataFetchingTable
        endpoint="countries"
        columns={countriesTableColumns}
        SubComponent={CountryTable}
      />
    </Container>
  );
};

/*
 * CustomMappingTable
 */
function mapApiToProps(api, { endpoint, fetchOptions }) {
  return {
    fetchData: queryParameters => api.get(endpoint, { ...fetchOptions, ...queryParameters }),
  };
}

const CustomDataFetchingTable = connectApi(mapApiToProps)(DumbDataFetchingTable);

const userColumns = [
  {
    title: 'Name',
    key: 'name',
  },
  {
    title: 'Surname',
    key: 'surname',
  },
  {
    title: 'Email',
    key: 'email',
  },
  {
    title: 'City',
    key: 'city',
  },
];

/*
 * CustomMappingTable Component
 * An example showing how the DataFetchingTable can be mapped to different apis
 */
export const CustomMappingTable = () => (
  <Container>
    <CustomDataFetchingTable endpoint="users" columns={userColumns} />
  </Container>
);
