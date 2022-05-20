import React, { useMemo } from 'react';
import styled from 'styled-components';

// import { Document, Page, Text, PDFViewer } from '@react-pdf/renderer';
import { FlexCenter, SmallAlert } from '@tupaia/ui-components';
import { Typography } from '@material-ui/core';

import { useDashboardData } from '../../api';
import { yearToApiDates } from '../../api/queries/utils';
import { useUrlParams } from '../../utils';
import { EntityDetails } from './components/EntityDetails';
import { DashboardReport } from '../DashboardReport';
import Header from './components/Header';
import { useDashboardDropdownOptions } from '../../utils/useDashboardDropdownOptions';

const InfoAlert = styled(SmallAlert)`
  margin: auto;
`;

const DashboardTitleContainer = styled.div`
  text-align: start;
  margin-bottom: 20px;
`;

const DashboardReportContainer = styled(FlexCenter)`
  min-width: 100%;
`;

const Divider = styled.hr`
  border-top: 3px solid #d13333;
`;

export const DashboardExportPreview = () => {
  const { entityCode } = useUrlParams();
  const { dropdownOptions } = useDashboardDropdownOptions();
  const profileDropDownOptions = dropdownOptions.find(({ value }) => value === 'profile');
  const { filterSubDashboards } = profileDropDownOptions.componentProps;
  const { data, isLoading, isError, error } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });
  const subDashboards = useMemo(() => data?.filter(filterSubDashboards), [
    data,
    filterSubDashboards,
  ]);
  console.log(data, isLoading, isError, error);
  const { startDate, endDate } = yearToApiDates('2021');

  return (
    <>
      <Header />
      <EntityDetails />
      {subDashboards?.map(dashboard => (
        <div>
          <DashboardTitleContainer>
            <Typography variant="h2">{dashboard.dashboardName}</Typography>
            <Divider />
          </DashboardTitleContainer>

          {dashboard.items.length > 0 ? (
            dashboard.items.map(item => (
              <DashboardReportContainer>
                <DashboardReport
                  key={item.code}
                  reportCode={item.reportCode}
                  name={item.name}
                  startDate={startDate}
                  endDate={endDate}
                />
              </DashboardReportContainer>
            ))
          ) : (
            <InfoAlert key={dashboard.dashboardName} severity="info" variant="standard">
              There are no reports available for this dashboard
            </InfoAlert>
          )}
        </div>
      ))}
    </>
  );
};
