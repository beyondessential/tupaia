/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import {
  CircleMeter,
  Card,
  CardContent,
  CardHeader,
  DataCardTabs,
  WarningCloud,
  Virus,
} from '@tupaia/ui-components';
import { DateToolbar, Container, Main, Sidebar, Header, HeaderTitle } from '../components';
import { CountriesTable, WeeklyReportsExportModal } from '../containers';
import { getCurrentIsoWeekNumber } from '../utils';

const StyledCardContent = styled(CardContent)`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ExampleContent = styled.div`
  padding: 3rem 1rem;
  text-align: center;
`;

const tabData = [
  {
    label: (
      <>
        <WarningCloud /> 3 Active Alerts
      </>
    ),
    content: <ExampleContent>Table Content</ExampleContent>,
  },
  {
    label: (
      <>
        <Virus /> 1 Active Outbreak
      </>
    ),
    content: <ExampleContent>Table Content</ExampleContent>,
  },
];

export const CountriesReportsView = () => (
  <>
    <Header Title={<HeaderTitle title="Countries" />} ExportModal={WeeklyReportsExportModal} />
    <DateToolbar />
    <Container>
      <Main data-testid="countries-table">
        <CountriesTable />
      </Main>
      <Sidebar>
        <Card variant="outlined">
          <CardHeader
            title="Current reports submitted"
            label={`Week ${getCurrentIsoWeekNumber()}`}
          />
          <StyledCardContent>
            <Typography variant="h3">11/22 Countries</Typography>
            <CircleMeter value={11} total={22} />
          </StyledCardContent>
        </Card>
        {/* Temporarily removed for MVP release. Please do not delete */}
        {/*<Card variant="outlined">*/}
        {/*  <DataCardTabs data={tabData} />*/}
        {/*</Card>*/}
      </Sidebar>
    </Container>
  </>
);
