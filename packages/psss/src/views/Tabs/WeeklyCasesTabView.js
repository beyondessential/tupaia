/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
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
import {
  checkCountryWeekIsLoading,
  getCountryWeeks,
  getCountryWeeksError,
  openWeeklyReportsPanel,
  reloadCountryWeeks,
} from '../../store';

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

export const WeeklyCasesTabViewComponent = React.memo(
  ({ fetchData, data, isLoading, errorMessage, handleOpen }) => {
    const [page, setPage] = useState(0);

    useEffect(() => {
      (async () => {
        await fetchData({ page });
      })();
    }, [fetchData, page]);

    return (
      <Container>
        <Main data-testid="country-table">
          <CountryTable
            data={data}
            isLoading={isLoading}
            errorMessage={errorMessage}
            page={page}
            setPage={setPage}
          />
          <WeeklyReportsPanel />
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
              <StyledButton fullWidth onClick={() => handleOpen(data[0].index)}>
                Review and Submit now
              </StyledButton>
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
  },
);

WeeklyCasesTabViewComponent.propTypes = {
  handleOpen: PropTypes.func.isRequired,
  fetchData: PropTypes.func.isRequired,
  data: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
};

WeeklyCasesTabViewComponent.defaultProps = {
  isLoading: false,
  errorMessage: '',
};

const mapStateToProps = state => ({
  data: getCountryWeeks(state),
  isLoading: checkCountryWeekIsLoading(state),
  error: getCountryWeeksError(state),
});

const mapDispatchToProps = dispatch => ({
  handleOpen: id => dispatch(openWeeklyReportsPanel(id)),
  fetchData: () => dispatch(reloadCountryWeeks({})),
});

export const WeeklyCasesTabView = connect(
  mapStateToProps,
  mapDispatchToProps,
)(WeeklyCasesTabViewComponent);
