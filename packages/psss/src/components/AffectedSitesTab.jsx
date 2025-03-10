import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { CardTabPanel, LoadingContainer } from '@tupaia/ui-components';
import { DottedTable, PercentageChangeCell } from './Table';
import {
  AlertsOutbreaksCard,
  AlertsOutbreaksCardHeader,
  AlertsAndOutbreaksCardBody,
} from './AlertsOutbreaksCard';
import { useWeeklyReportForAlert } from '../api';
import { getDisplayDatesByPeriod, getWeekNumberByPeriod } from '../utils';

const TabContent = styled.div`
  min-height: 300px;
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
    title: 'Prev. Week',
    key: 'percentageChange',
    CellComponent: PercentageChangeCellWrapper,
    sortable: false,
  },
  {
    title: 'Cases',
    key: 'weeklyCases',
    align: 'right',
    sortable: false,
  },
];

export const AffectedSitesTab = ({ alert }) => {
  const { data: weeklyData, isLoading, isFetching, error } = useWeeklyReportForAlert(alert);
  const isDataLoading = isLoading || isFetching;
  const noSitesAffected = !isDataLoading && weeklyData.length === 0;

  const renderTabContent = () => {
    if (error) {
      return null;
    }

    if (noSitesAffected) {
      return 'There are no affected sites to show';
    }

    return weeklyData.map(weekData => {
      const { status, period, weeklyCases, percentageChange, sites: siteData } = weekData;

      return (
        <AlertsOutbreaksCard key={period} variant="outlined" mb={5}>
          <AlertsOutbreaksCardHeader
            type={status}
            heading={`Week ${getWeekNumberByPeriod(period)}`}
            subheading={getDisplayDatesByPeriod(period)}
            detailText={`Total Cases for all Sites: ${weeklyCases || '-'}`}
            percentageChange={percentageChange}
          />
          <AlertsAndOutbreaksCardBody>
            <DottedTable columns={columns} data={siteData} />
          </AlertsAndOutbreaksCardBody>
        </AlertsOutbreaksCard>
      );
    });
  };

  return (
    <CardTabPanel>
      <LoadingContainer heading="Loading data" isLoading={isDataLoading} errorMessage={error}>
        <TabContent>{renderTabContent()}</TabContent>
      </LoadingContainer>
    </CardTabPanel>
  );
};

AffectedSitesTab.propTypes = {
  alert: PropTypes.shape({
    period: PropTypes.string,
    organisationUnit: PropTypes.string,
    syndrome: PropTypes.string,
  }).isRequired,
};
