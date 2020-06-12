/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Error, ErrorOutline, NotificationImportant } from '@material-ui/icons';
import {
  CardContent,
  CardFooter,
  CardHeader,
  BarMeter,
  Button,
  Card,
  DataCardTabs,
} from '@tupaia/ui-components';
import { Container, Main, Sidebar, CountryTable, WeeklyReportPanel } from '../components';

const ExampleContent = styled.div`
  padding: 3rem 1rem;
  text-align: center;
`;

const tabData = [
  {
    label: (
      <React.Fragment>
        <ErrorOutline /> 3 Active Alerts
      </React.Fragment>
    ),
    content: <ExampleContent>Table Content</ExampleContent>,
  },
  {
    label: (
      <React.Fragment>
        <NotificationImportant /> 1 Active Outbreak
      </React.Fragment>
    ),
    content: <ExampleContent>Table Content</ExampleContent>,
  },
];

const StyledButton = styled(Button)`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const StyledText = styled(Typography)`
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

export const CountryReportsViewWeekly = () => (
  <Container>
    <Main data-testid="country-table">
      <CountryTable />
      <WeeklyReportPanel />
    </Main>
    <Sidebar>
      <Card variant="outlined">
        <CardHeader
          color="error"
          title="Submission due in 3 days"
          label={<Error color="error" />}
        />
        <CardContent>
          <Typography variant="h4">Week 11</Typography>
          <Typography variant="h4" gutterBottom>
            Upcoming Report
          </Typography>
          <StyledText variant="subtitle2" gutterBottom>
            Feb 25, 2020 - Mar 1, 2020
          </StyledText>
          <StyledButton fullWidth>Review and Submit now</StyledButton>
        </CardContent>
        <CardFooter>
          <BarMeter value={22} total={30} legend="Sites reported" />
        </CardFooter>
      </Card>
      <Card variant="outlined">
        <DataCardTabs data={tabData} />
      </Card>
    </Sidebar>
  </Container>
);
