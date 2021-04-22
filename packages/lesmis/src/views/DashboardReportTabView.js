/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { SmallAlert } from '@tupaia/ui-components';
import { useDashboardData } from '../api/queries';
import {
  FetchLoader,
  TabsLoader,
  TabBarSection,
  FlexCenter,
  Report,
  TabBar,
  Tabs,
  Tab,
  TabPanel,
} from '../components';
import { DEFAULT_DASHBOARD_GROUP } from '../constants';

const DashboardSection = styled(FlexCenter)`
  min-height: 31rem;
`;

export const DashboardReportTabView = ({ entityCode, TabSelector }) => {
  const [selectedDashboard, setSelectedDashboard] = useState(DEFAULT_DASHBOARD_GROUP);
  const { data, isLoading, isError, error } = useDashboardData(entityCode);

  const handleChangeDashboard = (event, newValue) => {
    setSelectedDashboard(newValue);
  };

  return (
    <>
      <TabBar>
        <TabBarSection>
          {TabSelector}
          {/* Todo: add year selector */}
        </TabBarSection>
        {isLoading ? (
          <TabsLoader />
        ) : (
          <>
            <Tabs
              value={selectedDashboard}
              onChange={handleChangeDashboard}
              variant="scrollable"
              scrollButtons="auto"
            >
              {Object.entries(data).map(([heading]) => (
                <Tab key={heading} label={heading} value={heading} />
              ))}
            </Tabs>
          </>
        )}
      </TabBar>
      <DashboardSection>
        <FetchLoader isLoading={isLoading} isError={isError} error={error}>
          {data &&
            Object.entries(data).map(([heading, dashboardGroup]) => (
              <TabPanel key={heading} isSelected={heading === selectedDashboard}>
                {Object.entries(dashboardGroup).map(([groupName, groupValue]) => {
                  // Todo: support other report types
                  const dashboardReports = groupValue.views.filter(
                    report => report.type === 'chart',
                  );
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
  TabSelector: PropTypes.node.isRequired,
};
