/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Chart, ListVisual } from './Visuals';
import * as COLORS from '../constants';
import { useDashboardReportDataWithConfig } from '../api/queries';
import { FlexEnd } from './Layout';
import { useUrlParams } from '../utils';

const Container = styled.div`
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
  ({ name, reportCode, startDate, endDate, isEnlarged, isExporting }) => {
    const { search } = useLocation();
    const { entityCode } = useUrlParams();

    const { data, isLoading, isFetching, isError, error } = useDashboardReportDataWithConfig({
      entityCode,
      reportCode,
      startDate,
      endDate,
    });

    const { reportData, dashboardItemConfig: config, reportCodes } = data;
    const Visual = config?.type === 'list' ? ListVisual : Chart;
    const Wrapper = isEnlarged ? React.Fragment : Container;
    const drillDownPathname = `/${entityCode}/dashboard`;

    return (
      <Wrapper>
        <Visual
          viewContent={{ ...config, data: reportData, startDate, endDate }}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          error={error}
          name={name}
          isExporting={isExporting}
          drilldownPathname={drillDownPathname}
          reportCodes={reportCodes}
          isEnlarged={isEnlarged}
        />
        {!isEnlarged && (
          <Footer>
            <Button
              component={RouterLink}
              endIcon={<KeyboardArrowRightIcon />}
              color="primary"
              to={{
                pathname: drillDownPathname,
                search: `${search}&reportCode=${reportCode}`,
              }}
            >
              See More
            </Button>
          </Footer>
        )}
      </Wrapper>
    );
  },
);

DashboardReport.propTypes = {
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  name: PropTypes.string,
  reportCode: PropTypes.string,
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
};

DashboardReport.defaultProps = {
  startDate: null,
  endDate: null,
  reportCode: null,
  name: null,
  isEnlarged: false,
  isExporting: false,
};
