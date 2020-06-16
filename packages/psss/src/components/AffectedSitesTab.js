/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Card } from '@tupaia/ui-components';
import { DottedTable } from './Table';

const Container = styled.div`
  margin-bottom: 1rem;
`;

const data = [
  {
    id: '1',
    name: 'Sentinel Site Name',
    prevWeek: '15',
    totalCases: '15',
  },
  {
    id: '2',
    name: 'Tafuna Health Clinic',
    prevWeek: '15',
    totalCases: '10',
  },
  {
    id: '3',
    name: 'Sentinel Site Name',
    prevWeek: '55',
    totalCases: '1592',
  },
  {
    id: '4',
    name: 'Sentinel Site Name',
    prevWeek: '6',
    totalCases: '151',
  },
  {
    id: '5',
    name: 'Sentinel Site Name',
    prevWeek: '7',
    totalCases: '65',
  },
];

const columns = [
  {
    title: 'Name',
    key: 'name',
  },
  {
    title: 'Previous Week Change',
    key: 'prevWeek',
  },
  {
    title: 'Cases',
    key: 'totalCases',
  },
];

export const AffectedSitesTab = () => {
  return (
    <React.Fragment>
      <Card variant="outlined" mb={3}>
        <DottedTable columns={columns} data={data} />
      </Card>
      <Card variant="outlined" mb={3}>
        <DottedTable columns={columns} data={data} />
      </Card>
      <Card variant="outlined" mb={3}>
        <DottedTable columns={columns} data={data} />
      </Card>
    </React.Fragment>
  );
};
