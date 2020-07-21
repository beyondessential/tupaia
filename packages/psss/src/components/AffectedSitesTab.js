/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { CardTabPanel } from '@tupaia/ui-components';
import {
  createTotalCasesAccessor,
  createPercentageChangeAccessor,
  DottedTable,
  PercentageChangeCell,
} from './Table';
import {
  AlertsOutbreaksCard,
  AlertsOutbreaksCardHeader,
  AlertsAndOutbreaksCardBody,
} from './AlertsOutbreaksCard';
import { fetchStateShape } from '../hooks';
import { FetchLoader } from './FetchLoader';

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
    title: 'Prev. Week',
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

export const AffectedSitesTab = ({ state }) => {
  const { data: weeks } = state;

  return (
    <CardTabPanel>
      <FetchLoader state={state} noDataMessage="There are no affected sites to show">
        {weeks.map(week => {
          const startDate = format(week.startDate, 'LLL d');
          const endDate = format(week.endDate, 'LLL d');
          const year = format(week.endDate, 'yyyy');
          return (
            <AlertsOutbreaksCard key={week.id} variant="outlined" mb={5}>
              <AlertsOutbreaksCardHeader
                type={week.status}
                heading={`Week ${week.weekNumber}`}
                subheading={`${startDate} - ${endDate}, ${year}`}
                detailText={`Total Cases for all Sites: ${week.totalCases}`}
                percentageChange={week.percentageChange}
              />
              <AlertsAndOutbreaksCardBody>
                <DottedTable columns={columns} data={week.sites} />
              </AlertsAndOutbreaksCardBody>
            </AlertsOutbreaksCard>
          );
        })}
      </FetchLoader>
    </CardTabPanel>
  );
};

AffectedSitesTab.propTypes = {
  state: PropTypes.shape(fetchStateShape).isRequired,
};
