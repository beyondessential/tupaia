/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import { Warning } from '@material-ui/icons';
import {
  CardContent,
  CardFooter,
  CardHeader,
  BarMeter,
  Button,
  Card,
  DataCardTabs,
  WarningCloud,
  Virus,
} from '@tupaia/ui-components';
import { Container, Main, Sidebar } from '../../components';
import { CountryTable, WeeklyReportsPanel } from '../../containers';
import { getActiveWeekId, openWeeklyReportsPanel, setActiveWeek } from '../../store';
import { useLiveTableQuery, useTableQuery } from '../../api';

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

export const WeeklyCasesTabViewComponent = React.memo(({ handleOpen, activeWeek }) => {
  const [page, setPage] = useState(0);
  const { countryCode } = useParams();

  // Todo: Get the latest week data when there is real data
  const latestWeek = data ? data.data[0] : [];

  const {
    isLoading,
    error,
    data,
    order,
    orderBy,
    handleChangeOrderBy,
    isFetching,
  } = useLiveTableQuery(`confirmedWeeklyReport/${countryCode.toUpperCase()}`, {
    params: { startWeek: '2020W14', endWeek: '2020W22' },
  });

  if (!isLoading) {
    console.log('single country data', data?.data?.results);
  }

  return (
    <Container>
      <Main data-testid="country-table">
        <CountryTable
          data={!isLoading ? data?.data?.results : []}
          isLoading={isLoading}
          errorMessage={error && error.message}
          order={order}
          orderBy={orderBy}
          onChangeOrderBy={handleChangeOrderBy}
          page={page}
          setPage={setPage}
          rowIdKey="period"
        />
        {isFetching && 'Fetching...'}
        {!isLoading && activeWeek !== null && (
          <WeeklyReportsPanel activeWeek={activeWeek} countryWeekData={data.data[activeWeek]} />
        )}
      </Main>
      <Sidebar>
        <Card variant="outlined">
          <CardHeader
            color="error"
            title="Submission due in 3 days"
            label={<Warning color="error" />}
          />
          <CardContent>
            <Typography variant="h4">Week 11</Typography>
            <Typography variant="h4" gutterBottom>
              Upcoming Report
            </Typography>
            <DateSubtitle variant="subtitle2" gutterBottom>
              Feb 25, 2020 - Mar 1, 2020
            </DateSubtitle>
            {/* Todo: update with id when there is real data */}
            <StyledButton fullWidth onClick={() => handleOpen(latestWeek.index)}>
              Review and Confirm now
            </StyledButton>
          </CardContent>
          <CardFooter>
            <BarMeter value={22} total={30} legend="Sites reported" />
          </CardFooter>
        </Card>
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
  activeWeek: PropTypes.number.isRequired,
};

const mapStateToProps = state => ({ activeWeek: getActiveWeekId(state) });

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
