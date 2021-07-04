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

export const CHART_TYPES = {
  AREA: 'area',
  BAR: 'bar',
  COMPOSED: 'composed',
  LINE: 'line',
  PIE: 'pie',
};

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
  }) => {
    const { code: itemCode, legacy } = viewConfig;
    const { startDate, endDate } = yearToApiDates(year);
    const { data, isLoading, isError, error } = useDashboardReportData({
      entityCode,
      reportCode,
      dashboardCode,
      itemCode,
      legacy,
      periodGranularity,
      startDate,
      endDate,
    });

    return (
      <Container>
        <Chart
          viewContent={{ ...viewConfig, data, startDate, endDate }}
          isLoading={isLoading}
          isError={isError}
          error={error}
          name={name}
        />
        <Footer>
          <DashboardReportModal
            buttonText="See More"
            name={name}
            entityCode={entityCode}
            dashboardCode={dashboardCode}
            dashboardName={dashboardName}
            reportCode={reportCode}
            periodGranularity={periodGranularity}
            viewConfig={viewConfig}
          />
        </Footer>
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
