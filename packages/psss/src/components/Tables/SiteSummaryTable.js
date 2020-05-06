/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/*
 * SiteWeekTable
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import {
  CondensedTableBody,
  DataFetchingTable,
  AFRAccessor,
  FakeHeader,
  SitesReportedAccessor,
  Button,
} from '@tupaia/ui-components';

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
`;

const NameAccessor = data => {
  return <span>{data.name} Clinic</span>;
};

const siteWeekColumns = [
  {
    title: 'Name',
    key: 'name',
    width: '30%',
    align: 'left',
    accessor: NameAccessor,
  },
  {
    title: 'Sites Reported',
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

const TableHeader = () => {
  return <FakeHeader>10/30 Sentinel Sites Reported</FakeHeader>;
};

/*
 * CountryWeekSummaryTable Component
 */
export const SiteSummaryTable = props => {
  const customAction = () => {
    console.log('custom action in CountryWeekSummaryTable. props...', props);
  };

  return (
    <React.Fragment>
      <TableHeader />
      <DataFetchingTable
        endpoint="sites"
        columns={siteWeekColumns}
        Header={false}
        Body={CondensedTableBody}
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
