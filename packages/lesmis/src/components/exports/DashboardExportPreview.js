import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { FlexColumn, SmallAlert } from '@tupaia/ui-components';
import { Typography } from '@material-ui/core';
import { EntityDetails, A4Page } from './components';
import { yearToApiDates } from '../../api/queries/utils';
import { DashboardReport } from '../DashboardReport';

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
  const { startDate, endDate } = yearToApiDates('2021');
  let page = 0;
  const getNextPage = () => {
    page++;
    return page;
  };

  const getChildren = dashboard => {
    const { items } = dashboard;
    if (items.length > 0) {
      return dashboard.items.map(item => {
        return (
          <A4Page
            key={item.code}
            addToRefs={addToRefs}
            page={getNextPage()}
            currentPage={currentPage}
          >
            <FlexColumn>
              <DashboardTitleContainer>
                <Typography variant="h2">{dashboard.dashboardName}</Typography>
                <Divider />
                <Typography variant="h5">{item.name}</Typography>
              </DashboardTitleContainer>
              <DashboardReport
                reportCode={item.reportCode}
                name={item.name}
                startDate={startDate}
                endDate={endDate}
                />
            </FlexColumn>
          </A4Page>
        );
      });
    }

    return (
      <A4Page
        key={dashboard.dashboardName}
        addToRefs={addToRefs}
        page={getNextPage()}
        currentPage={currentPage}
      >
        <DashboardTitleContainer>
          <Typography variant="h2">{dashboard.dashboardName}</Typography>
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
      {/* First page for profile */}
      <A4Page addToRefs={addToRefs} page={getNextPage()} currentPage={currentPage}>
        <EntityDetails />
      </A4Page>
      {/* Sub dashboards */}
      {subDashboards?.map(dashboard => getChildren(dashboard))}
    </Container>
  );
};

DashboardExportPreview.propTypes = {
  subDashboards: PropTypes.array.isRequired,
  addToRefs: PropTypes.func.isRequired,
  currentPage: PropTypes.number.isRequired,
};
