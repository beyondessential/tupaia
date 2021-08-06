/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
// import { ListVisual } from '@tupaia/ui-components';
import Button from '@material-ui/core/Button';
import { ListVisual } from './ListVisual';
import { DashboardReportModal } from './DashboardReportModal';
import { Chart } from './Chart';
import * as COLORS from '../constants';
import { useDashboardReportData } from '../api/queries';
import { yearToApiDates } from '../api/queries/utils';
import { FlexEnd } from './Layout';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { Link as RouterLink } from 'react-router-dom';

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
  ({ entityCode, dashboardCode, year, viewConfig, drillDowns }) => {
    const { code: itemCode, legacy, periodGranularity, reportCode, name, type } = viewConfig;
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

    if (type === 'list') {
      return (
        <Container>
          List Visual
          {/*<ListVisual*/}
          {/*  viewContent={{ ...viewConfig, data, startDate, endDate }}*/}
          {/*  isLoading={isLoading}*/}
          {/*  isError={isError}*/}
          {/*  error={error}*/}
          {/*  drillDowns={drillDowns}*/}
          {/*  dashboard={dashboard}*/}
          {/*  DrillDownComponent={DashboardReportModal}*/}
          {/*/>*/}
        </Container>
      );
    }

    return (
      <Container>
        <Chart
          viewContent={{ ...viewConfig, data, startDate, endDate }}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error}
          name={name}
        />
        <Footer>
          <Button
            component={RouterLink}
            endIcon={<KeyboardArrowRightIcon />}
            color="primary"
            to={{
              pathname: `${entityCode}/dashboard`,
              search: `?dashboard=${dashboardCode}&reportCode=${reportCode}`,
            }}
          >
            See More
          </Button>
        </Footer>
      </Container>
    );
  },
);

const VIEW_CONFIG_SHAPE = PropTypes.shape({
  code: PropTypes.string.isRequired,
  legacy: PropTypes.bool.isRequired,
  periodGranularity: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  reportCode: PropTypes.string.isRequired,
});

DashboardReport.propTypes = {
  entityCode: PropTypes.string.isRequired,
  drillDowns: PropTypes.array,
  year: PropTypes.string,
  dashboardCode: PropTypes.string.isRequired,
  viewConfig: VIEW_CONFIG_SHAPE.isRequired,
};

DashboardReport.defaultProps = {
  year: null,
  drillDowns: [],
};
