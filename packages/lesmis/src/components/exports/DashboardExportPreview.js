import React from 'react';
// import styled from 'styled-components';

// import { Document, Page, Text, PDFViewer } from '@react-pdf/renderer';
// import { SmallAlert } from '@tupaia/ui-components';

import { useDashboardData } from '../../api';
import { yearToApiDates } from '../../api/queries/utils';
import { useUrlParams } from '../../utils';
import { EntityDetails } from './components/EntityDetails';
import { DashboardReport } from '../DashboardReport';
import Header from './components/Header';

// const InfoAlert = styled(SmallAlert)`
//   margin: auto;
// `;

export const DashboardExportPreview = () => {
  const { entityCode } = useUrlParams();

  const { data, isLoading, isError, error } = useDashboardData({
    entityCode,
    includeDrillDowns: false,
  });
  console.log(data, isLoading, isError, error);
  const { startDate, endDate } = yearToApiDates('2021');

  return (
    <>
      <Header />
      <EntityDetails />
      {data?.map(dashboard => (
        <div>
          {
            dashboard.items.length > 0 &&
              dashboard.items.map(item => (
                <DashboardReport
                  key={item.code}
                  reportCode={item.reportCode}
                  name={item.name}
                  startDate={startDate}
                  endDate={endDate}
                />
              ))
            // : (
            //   <InfoAlert key={dashboard.dashboardName} severity="info" variant="standard">
            //     There are no reports available for this dashboard
            //   </InfoAlert>
            // )
          }
        </div>
      ))}
    </>
  );
};
