/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { DashboardReportModal } from './DashboardReportModal';
import { Chart } from './Chart';
import { ListVisual } from './ListVisual/ListVisual';
import * as COLORS from '../constants';
import { useDashboardReportData } from '../api/queries';
import { yearToApiDates } from '../api/queries/utils';
import { FlexEnd } from './Layout';

const Container = styled.div`
  width: 55rem;
  max-width: 100%;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  margin-bottom: 1.8rem;
  border-radius: 3px;
`;

const Footer = styled(FlexEnd)`
  padding: 1.25rem 1.875rem;
  background: ${COLORS.GREY_F9};
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
`;

export const DashboardReport = React.memo(
  ({
    reportCode,
    name,
    entityCode,
    dashboardCode,
    dashboardName,
    periodGranularity,
    year,
    viewConfig,
    drillDowns,
  }) => {
    const { code: itemCode, legacy } = viewConfig;
    const { startDate, endDate } = yearToApiDates(year);

    const { data, isLoading, isFetching, isError, error } = useDashboardReportData({
      entityCode,
      reportCode,
      dashboardCode,
      itemCode,
      legacy,
      periodGranularity,
      startDate,
      endDate,
    });

    const VisualComponent = viewConfig.type === 'list' ? ListVisual : Chart;

    return (
      <Container>
        <VisualComponent
          viewContent={{ ...viewConfig, data, startDate, endDate }}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error}
          name={name}
          drillDowns={drillDowns}
          entityCode={entityCode}
          dashboardCode={dashboardCode}
          dashboardName={dashboardName}
        />
        {viewConfig.type !== 'list' && (
          <Footer>
            <DashboardReportModal
              name={name}
              entityCode={entityCode}
              dashboardCode={dashboardCode}
              dashboardName={dashboardName}
              reportCode={reportCode}
              periodGranularity={periodGranularity}
              viewConfig={viewConfig}
            />
          </Footer>
        )}
      </Container>
    );
  },
);

DashboardReport.propTypes = {
  name: PropTypes.string.isRequired,
  reportCode: PropTypes.string.isRequired,
  entityCode: PropTypes.string.isRequired,
  year: PropTypes.string,
  dashboardCode: PropTypes.string.isRequired,
  dashboardName: PropTypes.string.isRequired,
  periodGranularity: PropTypes.string,
  viewConfig: PropTypes.object.isRequired,
};

DashboardReport.defaultProps = {
  year: null,
  periodGranularity: null,
};
