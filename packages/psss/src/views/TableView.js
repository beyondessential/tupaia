/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { FakeHeader, Table } from '@tupaia/ui-components/src/components/Table';
import * as COLORS from '@tupaia/ui-components/stories/story-utils/theme/colors';
import { BorderlessTableBody } from '../components';

const Section = styled.section`
  background: white;
  border: 2px dashed black;
  height: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

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

export const TableView = ({ config }) => {
  return (
    <Container>
      <Inner>
        <FakeHeader>SYNDROMES</FakeHeader>
        <Table Header={false} Body={BorderlessTableBody} columns={paneColumns} data={siteData} />
      </Inner>
    </Container>
  );
};

TableView.propTypes = {
  config: PropTypes.object.isRequired,
};
