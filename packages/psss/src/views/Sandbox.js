/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CardTabPanel } from '@tupaia/ui-components';
import {
  AlertsAndOutbreaksCard,
  AlertsAndOutbreaksCardHeader,
  AlertsAndOutbreaksCardBody,
} from '../components/AlertsAndOutbreaksCard';
import { FakeAPI } from '../api';
import {
  Container,
  createPercentageChangeAccessor,
  createTotalCasesAccessor,
  DottedTable,
  FetchLoader,
  Main,
  PercentageChangeCell,
} from '../components';
import { useFetch } from '../hooks';

const PanelContainer = styled.div`
  margin: 0 auto;
  max-width: 600px;
`;

const PercentageChangeCellWrapper = ({ displayValue }) => (
  <PercentageChangeCell percentageChange={displayValue} />
);

PercentageChangeCellWrapper.propTypes = {
  displayValue: PropTypes.number.isRequired,
};

const columns = [
  {
    title: 'Affected Sentinel Sites',
    key: 'name',
    width: '250px',
    sortable: false,
  },
  {
    title: 'Prev.Week',
    key: 'percentageChange',
    CellComponent: PercentageChangeCellWrapper,
    accessor: createPercentageChangeAccessor('afr'),
    sortable: false,
  },
  {
    title: 'Cases',
    key: 'totalCases',
    align: 'right',
    accessor: createTotalCasesAccessor('afr'),
    sortable: false,
  },
];

const fetchSitesData = () => FakeAPI.get('affected-sites');

export const Sandbox = () => {
  const state = useFetch(fetchSitesData);
  const { data: weeks } = state;

  return (
    <Container>
      <Main>
        <PanelContainer>
          <CardTabPanel>
            <FetchLoader state={state}>
              {weeks.map((week, index) => {
                const startDate = format(week.startDate, 'LLL d');
                const endDate = format(week.endDate, 'LLL d');
                const year = format(week.endDate, 'yyyy');
                return (
                  <AlertsAndOutbreaksCard key={week.id} mb={5}>
                    <AlertsAndOutbreaksCardHeader
                      type={index === 0 ? 'outbreak' : 'alert'}
                      heading={`Week ${week.week}`}
                      subheading={`${startDate} - ${endDate}, ${year}`}
                      detailText={`Total Cases for all Sites: ${week.totalCases}`}
                      percentageChange={week.percentageChange}
                    />
                    <AlertsAndOutbreaksCardBody>
                      <DottedTable columns={columns} data={week.sites} />
                    </AlertsAndOutbreaksCardBody>
                  </AlertsAndOutbreaksCard>
                );
              })}
            </FetchLoader>
          </CardTabPanel>
        </PanelContainer>
      </Main>
    </Container>
  );
};
