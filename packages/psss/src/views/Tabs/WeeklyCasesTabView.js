/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import { Button, WarningCloud, Virus } from '@tupaia/ui-components';
import { Container, Main, Sidebar } from '../../components';
import { CountryTable, UpcomingReportCard, WeeklyReportsPanel } from '../../containers';
import { getActiveWeek, openWeeklyReportsPanel, setActiveWeek } from '../../store';
import { getCurrentPeriod } from '@tupaia/utils';
import { useCountryWeeklyReport } from '../../api';

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

const StyledButton = styled(Button)`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const DateSubtitle = styled(Typography)`
  margin-top: 1rem;
  margin-bottom: 1rem;
  font-weight: 400;
  color: ${props => props.theme.palette.text.secondary};
`;

const getCountryWeekData = (data, activeWeek) => data.find(c => c.period === activeWeek);

const NUMBER_OF_WEEKS = 10;

export const WeeklyCasesTabViewComponent = React.memo(({ handleOpen, activeWeek }) => {
  const { countryCode } = useParams();
  const defaultPeriod = getCurrentPeriod('WEEK');

  const { isLoading, error, data } = useCountryWeeklyReport(
    countryCode.toUpperCase(),
    defaultPeriod,
    NUMBER_OF_WEEKS,
  );

  return (
    <Container>
      <Main data-testid="country-table">
        <CountryTable
          data={data}
          isLoading={isLoading}
          errorMessage={error && error.message}
          rowIdKey="period"
        />
        {/*{!isLoading && (*/}
        {/*  <WeeklyReportsPanel countryWeekData={getCountryWeekData(data, activeWeek)} />*/}
        {/*)}*/}
      </Main>

      <Sidebar>
        <UpcomingReportCard />
        {/* Temporarily removed for MVP release. Please do not delete */}
        {/*<Card variant="outlined">*/}
        {/*  <DataCardTabs data={tabData} />*/}
        {/*</Card>*/}
      </Sidebar>
    </Container>
  );
});

WeeklyCasesTabViewComponent.propTypes = {
  handleOpen: PropTypes.func.isRequired,
  activeWeek: PropTypes.string,
};

WeeklyCasesTabViewComponent.defaultProps = {
  activeWeek: null,
};

const mapStateToProps = state => ({ activeWeek: getActiveWeek(state) });

const mapDispatchToProps = dispatch => ({
  handleOpen: id => {
    dispatch(setActiveWeek(id));
    dispatch(openWeeklyReportsPanel());
  },
});

export const WeeklyCasesTabView = connect(
  mapStateToProps,
  mapDispatchToProps,
)(WeeklyCasesTabViewComponent);
