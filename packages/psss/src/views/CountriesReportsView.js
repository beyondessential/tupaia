/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import {
  CircleMeter,
  BaseToolbar,
  Card,
  CardContent,
  CardHeader,
  DataCardTabs,
  WarningCloud,
  Virus,
} from '@tupaia/ui-components';
import {
  Container,
  Main,
  Sidebar,
  Header,
  HeaderTitle,
  WeeklyReportsExportModal,
} from '../components';
import { CountriesTable } from '../containers';
import { checkIsRegionalUser, getActiveEntity } from '../store';

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

export const CountriesReportsViewComponent = ({ isRegionalUser, activeEntity }) => {
  if (!isRegionalUser) {
    // Todo: get slug from active entity
    const slug = activeEntity.toLowerCase();
    return <Redirect to="/weekly-reports/american-samoa" />;
  }

  return (
    <>
      <Header Title={<HeaderTitle title="Countries" />} ExportModal={WeeklyReportsExportModal} />
      <BaseToolbar />
      <Container>
        <Main data-testid="countries-table">
          <CountriesTable />
        </Main>
        <Sidebar>
          <Card variant="outlined">
            <CardHeader title="Current reports submitted" label="Week 10" />
            <StyledCardContent>
              <Typography variant="h3">11/22 Countries</Typography>
              <CircleMeter value={11} total={22} />
            </StyledCardContent>
          </Card>
          <Card variant="outlined">
            <DataCardTabs data={tabData} />
          </Card>
        </Sidebar>
      </Container>
    </>
  );
};

CountriesReportsViewComponent.propTypes = {
  isRegionalUser: PropTypes.bool.isRequired,
  activeEntity: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  isRegionalUser: checkIsRegionalUser(state),
  activeEntity: getActiveEntity(state),
});

export const CountriesReportsView = connect(mapStateToProps)(CountriesReportsViewComponent);
