/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiLink from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { Alarm, CheckCircleOutline } from '@material-ui/icons';
import { DumbDataFetchingTable, DataFetchingTable } from '../components/DataFetchingTable';
import { Button } from '../components/Button';
import * as COLORS from '../theme/colors';
import { NestedTableBody } from '../components/Table';
import { getAFRAlert, getSitesReported } from '../components/TableColumnAccessors';
import { connectApi } from '../api';

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
const CountrySubTable = props => {
  const CountryWeekTitle = styled.div`
    color: ${COLORS.BLUE};
    font-weight: 500;
    font-size: 16px;
    line-height: 19px;
    margin-bottom: 3px;
  `;

  const CountryWeekSubTitle = styled.div`
    color: ${COLORS.TEXT_DARKGREY};
    font-size: 14px;
    line-height: 16px;
  `;

  const getCountryWeekTitle = data => {
    return (
      <React.Fragment>
        <CountryWeekTitle>{`Week ${data.week}`}</CountryWeekTitle>
        <CountryWeekSubTitle>Feb 25 - Mar 1, 2020</CountryWeekSubTitle>
      </React.Fragment>
    );
  };

  const countryWeekColumns = [
    {
      title: 'Name',
      key: 'name',
      width: '30%',
      align: 'left',
      accessor: getCountryWeekTitle,
    },
    {
      title: 'Sites Reported',
      key: 'sitesReported',
      accessor: getSitesReported,
      width: '145px',
    },
    {
      title: 'AFR',
      key: 'AFR',
      accessor: getAFRAlert,
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
        fetchOptions={{ filterId: props.rowData.uid }}
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
const CountryTitle = styled(MuiLink)`
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
    const handleClick = e => {
      e.preventDefault();
      e.stopPropagation();
      console.log('route to country page');
    };

    return (
      <CountryTitle href="#" onClick={handleClick}>
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
      accessor: getSitesReported,
      width: '145px',
    },
    {
      title: 'AFR',
      key: 'AFR',
      accessor: getAFRAlert,
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

  const getSiteWeekTitle = data => {
    // console.log('data', data);
    return <span>{data.name}</span>;
  };

  const siteWeekColumns = [
    {
      title: 'Name',
      key: 'name',
      width: '30%',
      align: 'left',
      accessor: getSiteWeekTitle,
    },
    {
      title: 'Sites Reported',
      key: 'sitesReported',
      accessor: getSitesReported,
      width: '145px',
    },
    {
      title: 'AFR',
      key: 'AFR',
      accessor: getAFRAlert,
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
export const CountryWeekTable = () => {
  const getCountryWeekTitle = data => {
    // console.log('data', data);
    return 'W9 Feb 25 - Mar 1, 2020';
  };

  const Status = styled.div`
    display: inline-flex;
    color: ${props => props.color};
    align-items: center;
    text-transform: uppercase;
    font-weight: 500;
    font-size: 11px;
    line-height: 13px;

    .MuiSvgIcon-root {
      width: 26px;
      height: 26px;
      margin-right: 5px;
    }
  `;

  // eslint-disable-next-line react/prop-types
  const getStatus = ({ status }) => {
    if (status === 'Overdue') {
      return (
        <Status color={COLORS.RED}>
          <Alarm />
          {status}
        </Status>
      );
    }

    return (
      <Status color={COLORS.TEXT_LIGHTGREY}>
        <CheckCircleOutline />
        {status}
      </Status>
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
      accessor: getSitesReported,
      width: '145px',
    },
    {
      title: 'AFR',
      key: 'AFR',
      accessor: getAFRAlert,
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
      width: '125px',
      align: 'left',
      accessor: getStatus,
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

function mapApiToProps(api, { endpoint, fetchOptions }) {
  return {
    fetchData: queryParameters => api.get(endpoint, { ...fetchOptions, ...queryParameters }),
  };
}

const CustomDataFetchingTable = connectApi(mapApiToProps)(DumbDataFetchingTable);
/*
 * CustomMappingTable
 * An example showing how the DataFetchingTable can be mapped to different apis
 */
export const CustomMappingTable = () => {
  const userColumns = [
    {
      title: 'Name',
      key: 'name',
    },
    {
      title: 'Surname',
      key: 'email',
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

  return (
    <Container>
      <CustomDataFetchingTable endpoint="users" columns={userColumns} />
    </Container>
  );
};
