/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { SmallAlert } from '@tupaia/ui-components';
import { useDashboardData } from '../api/queries';
import {
  FetchLoader,
  TabBar,
  TabBarLoader,
  FlexCenter,
  Report,
  TabBarTabs,
  TabBarTab,
  TabPanel,
  YearSelector,
} from '../components';

const DashboardSection = styled(FlexCenter)`
  min-height: 31rem;
`;

export const DashboardReportTabView = ({
  entityCode,
  selectedDashboard,
  setSelectedDashboard,
  selectedYear,
  setSelectedYear,
}) => {
  const { data, isLoading, isError, error } = useDashboardData(entityCode);

  const handleChangeDashboard = (event, newValue) => {
    setSelectedDashboard(newValue);
  };

  return (
    <>
      <TabBar>
        {isLoading ? (
          <TabBarLoader />
        ) : (
          <>
            {/* Todo: add year selector @see https://github.com/beyondessential/tupaia-backlog/issues/2286*/}
            {/*<YearSelector selectedYear={selectedYear} setSelectedYear={setSelectedYear} />*/}
            <TabBarTabs
              value={selectedDashboard}
              onChange={handleChangeDashboard}
              variant="scrollable"
              scrollButtons="auto"
            >
              {Object.entries(data).map(([heading]) => (
                <TabBarTab key={heading} label={heading} value={heading} />
              ))}
            </TabBarTabs>
          </>
        )}
      </TabBar>
      <DashboardSection>
        <FetchLoader isLoading={isLoading} isError={isError} error={error}>
          {data &&
            Object.entries(data).map(([heading, dashboardGroup]) => (
              <TabPanel key={heading} isSelected={key === selectedTab}>
                {Object.entries(dashboardGroup).map(([groupName, groupValue]) => {
                  // Todo: support other report types
                  const dashboardReports = groupValue.views.filter(report => report.type === 'chart');
                  return dashboardReports.length > 0 ? (
                    dashboardReports.map(report => (
                      <Report
                        key={report.viewId}
                        name={report.name}
                        entityCode={entityCode}
                        dashboardGroupId={groupValue.dashboardGroupId.toString()}
                        reportId={report.viewId}
                        periodGranularity={report.periodGranularity}
                      />
                    ))
                  ) : (
                    <SmallAlert key={groupName} severity="info" variant="standard">
                      There are no reports available for this dashboard
                    </SmallAlert>
                  );
                })}
              </TabPanel>
            ))}
        </FetchLoader>
      </DashboardSection>
    </>
  );
};

DashboardReportTabView.propTypes = {
  entityCode: PropTypes.string.isRequired,
  selectedDashboard: PropTypes.string.isRequired,
  setSelectedDashboard: PropTypes.func.isRequired,
  selectedYear: PropTypes.string.isRequired,
  setSelectedYear: PropTypes.func.isRequired,
};
