/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import { DataFetchingTable } from '../components/DataFetchingTable';
import { Button } from '../components/Button';
import * as COLORS from '../theme/colors';
import { NestedTableBody, TableRowContext } from '../components/Table';

export default {
  title: 'DataFetchingTable',
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

const GreyBox = styled.div`
  width: 100%;
  background: #f1f1f1;
  font-weight: 500;
  font-size: 11px;
  line-height: 13px;
  color: #6f7b82;
  border-bottom: 1px solid #dedee0;
  padding: 16px 20px;
`;

const FakeHeader = () => {
  return <GreyBox>10/30 Sentinel Sites Reported</GreyBox>;
};

/*
 * CountrySubTable
 */
const CountrySubTable = () => {
  const getCountryWeekName = data => {
    // console.log('data', data);
    return 'W9 Feb 25 - Mar 1, 2020';
  };

  const countryWeekColumns = [
    {
      title: 'Name',
      key: 'name',
      width: '30%',
      align: 'left',
      accessor: getCountryWeekName,
    },
    {
      title: 'Sites Reported',
      key: 'sitesReported',
      width: '145px',
    },
    {
      title: 'AFR',
      key: 'AFR',
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

  return (
    <React.Fragment>
      <FakeHeader />
      <DataFetchingTable
        endpoint="country-weeks"
        columns={countryWeekColumns}
        Header={false}
        Body={NestedTableBody}
        SubComponent={CountryWeekSubTable}
      />
    </React.Fragment>
  );
};

/*
 * CountryTable
 */
const CountryTitle = styled.div`
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 18px;
  line-height: 21px;
  color: ${COLORS.BLUE};

  .MuiAvatar-root {
    margin-right: 10px;
  }
`;

export const CountryTable = () => {
  const getCountryTitle = data => {
    console.log('data', data);
    return (
      <CountryTitle>
        <Avatar /> {data.name}
      </CountryTitle>
    );
  };

  const countryColumns = [
    {
      title: 'Name',
      key: 'name',
      width: '30%',
      align: 'left',
      accessor: getCountryTitle,
    },
    {
      title: 'Sites Reported',
      key: 'sitesReported',
      width: '145px',
    },
    {
      title: 'AFR',
      key: 'AFR',
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

  return (
    <Container>
      <DataFetchingTable
        endpoint="countries"
        columns={countryColumns}
        SubComponent={CountrySubTable}
      />
    </Container>
  );
};

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
`;

/*
 * CountryWeekSubTable
 */
const CountryWeekSubTable = props => {
  const customAction = () => {
    console.log('custom action in CountryWeekSubTable. props...', props);
  };

  const getSiteWeekName = data => {
    // console.log('data', data);
    return <span>{data.name}</span>;
  };

  const siteWeekColumns = [
    {
      title: 'Name',
      key: 'name',
      width: '30%',
      align: 'left',
      accessor: getSiteWeekName,
    },
    {
      title: 'Sites Reported',
      key: 'sitesReported',
      width: '145px',
    },
    {
      title: 'AFR',
      key: 'AFR',
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

  return (
    <React.Fragment>
      <FakeHeader />
      <DataFetchingTable
        endpoint="sites"
        columns={siteWeekColumns}
        Header={false}
        Body={NestedTableBody}
      />
      <StyledDiv>
        <Typography variant="body1">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit.
        </Typography>
        <Button onClick={customAction}>Save and Submit</Button>
      </StyledDiv>
    </React.Fragment>
  );
};

/*
 * CountryWeekTable
 */
const CountryWeekTitle = styled.div`
  color: ${COLORS.BLUE};
  font-weight: 500;
  font-size: 16px;
  line-height: 19px;
`;

const CountryWeekSubTitle = styled.div`
  color: ${COLORS.TEXT_DARKGREY};
  font-size: 14px;
  line-height: 16px;
`;

export const CountryWeekTable = () => {
  const getCountryWeekTitle = data => {
    // console.log('data', data);
    return (
      <React.Fragment>
        <CountryWeekTitle>{`Week ${data.week}`}</CountryWeekTitle>
        <CountryWeekSubTitle>Feb 25 - Mar 1, 2020</CountryWeekSubTitle>
      </React.Fragment>
    );
  };

  const countryWeekColumns = [
    {
      title: 'Date ',
      key: 'week',
      width: '30%',
      align: 'left',
      accessor: getCountryWeekTitle,
    },
    {
      title: 'Sites Reported',
      key: 'sitesReported',
      width: '145px',
    },
    {
      title: 'AFR',
      key: 'AFR',
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
    {
      title: 'Status',
      key: 'status',
    },
  ];

  return (
    <Container>
      <DataFetchingTable
        endpoint="country-weeks"
        columns={countryWeekColumns}
        SubComponent={CountryWeekSubTable}
      />
    </Container>
  );
};
