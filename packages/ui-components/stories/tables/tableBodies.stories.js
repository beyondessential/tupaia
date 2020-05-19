/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { FakeAPI } from '../story-utils/api';
import * as COLORS from '../story-utils/theme/colors';
import { Button, Table, TableBody, FakeHeader } from '../../src';

export default {
  title: 'Tables/TableBodies',
  component: Table,
};

const siteData = [
  {
    title: 'Acute Fever and Rash (AFR)',
    percentageChange: '+15%',
    totalCases: '15',
  },
  {
    title: 'Diarrhoea (DIA)',
    percentageChange: '+7%',
    totalCases: '20',
  },
  {
    title: 'Influenza-like Illness (ILI)',
    percentageChange: '+10%',
    totalCases: '115',
  },
  {
    title: 'Prolonged Fever (AFR)',
    percentageChange: '-12%',
    totalCases: '5',
  },
  {
    title: 'Dengue-like Illness (DIL)',
    percentageChange: '+9%',
    totalCases: '54',
  },
];

const Container = styled.div`
  width: 100%;
  padding: 3rem;
  background: ${COLORS.LIGHTGREY};

  > div {
    max-width: 900px;
    margin: 0 auto;
  }
`;

const Inner = styled.div`
  width: 500px;
  background: white;
`;

const paneColumns = [
  {
    title: 'Title',
    key: 'title',
    width: '300px',
  },
  {
    title: 'Percentage Increase',
    key: 'percentageIncrease',
  },
  {
    title: 'Total Cases',
    key: 'totalCases',
  },
];

const CustomBody = styled(TableBody)`
  width: 500px;
  background: white;
`;

export const PaneTable = () => {
  return (
    <Container>
      <Inner>
        <FakeHeader>SYNDROMES</FakeHeader>
        <Table Header={false} columns={paneColumns} data={siteData} />
      </Inner>
    </Container>
  );
};
