/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Card, CardTabPanel } from '@tupaia/ui-components';
import { DottedTable } from './Table';
import { CardHeader } from './CardHeader';

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
    sortable: false,
  },
  {
    title: '',
    key: 'prevWeek',
    sortable: false,
  },
  {
    title: 'Cases',
    key: 'totalCases',
    sortable: false,
  },
];

export const AffectedSitesTab = () => {
  return (
    <CardTabPanel>
      <Card variant="outlined" mb={5}>
        <CardHeader />
        <DottedTable columns={columns} data={data} />
      </Card>
      <Card variant="outlined" mb={5}>
        <CardHeader />
        <DottedTable columns={columns} data={data} />
      </Card>
      <Card variant="outlined" mb={5}>
        <CardHeader />
        <DottedTable columns={columns} data={data} />
      </Card>
    </CardTabPanel>
  );
};
