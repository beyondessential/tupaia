import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { SmallAlert } from '@tupaia/ui-components';
import { Typography } from '@material-ui/core';
import { EntityDetails, A4Page } from './components';
import { yearToApiDates } from '../../api/queries/utils';
import { DashboardReport } from '../DashboardReport';
import { useExportOptions } from './context/ExportOptionsContext';
import { DEFAULT_DATA_YEAR } from '../../constants';

const InfoAlert = styled(SmallAlert)`
  margin: auto;
`;

const DashboardTitleContainer = styled.div`
  text-align: start;
  margin-bottom: 50px;
`;

const Container = styled.div`
  position: relative;
  height: 1600px;
`;

const Divider = styled.hr`
  border-top: 3px solid #d13333;
`;

export const DashboardExportPreview = ({ addToRefs, subDashboards, currentPage }) => {
  const { exportWithLabels, exportWithTable } = useExportOptions();
  let page = 0;
  const getNextPage = () => {
    page++;
    return page;
  };
  const getChildren = (subDashboard, isFirstPageProfile) => {
    const { items, useYearSelector, ...configs } = subDashboard;
    const { startDate, endDate } = useYearSelector ? yearToApiDates(DEFAULT_DATA_YEAR) : {};

    if (items.length > 0) {
      return subDashboard.items.map((item, index) => {
        return (
          <A4Page
            key={item.code}
            page={getNextPage()}
            {...{ ...configs, useYearSelector, addToRefs, currentPage }}
          >
            {isFirstPageProfile && index === 0 && <EntityDetails />}
            <DashboardTitleContainer>
              <Typography variant="h2">{subDashboard.dashboardName}</Typography>
              <Divider />
              <Typography variant="h5">{item.name}</Typography>
            </DashboardTitleContainer>
            <DashboardReport
              reportCode={item.reportCode}
              name={item.name}
              startDate={startDate}
              endDate={endDate}
              exportOptions={{
                exportWithLabels,
                exportWithTable,
              }}
              isExporting
              isEnlarged
            />
          </A4Page>
        );
      });
    }

    return (
      <A4Page
        key={subDashboard.dashboardName}
        page={getNextPage()}
        {...{ ...configs, useYearSelector, addToRefs, currentPage }}
      >
        {isFirstPageProfile && <EntityDetails />}
        <DashboardTitleContainer>
          <Typography variant="h2">{subDashboard.dashboardName}</Typography>
          <Divider />
        </DashboardTitleContainer>
        <InfoAlert severity="info" variant="standard">
          There are no reports available for this dashboard
        </InfoAlert>
      </A4Page>
    );
  };

  return (
    <Container>
      {subDashboards?.map((subDashboard, index) => {
        const isFirstPageProfile = index === 0;
        return getChildren(subDashboard, isFirstPageProfile);
      })}
    </Container>
  );
};

DashboardExportPreview.propTypes = {
  subDashboards: PropTypes.array.isRequired,
  addToRefs: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};
