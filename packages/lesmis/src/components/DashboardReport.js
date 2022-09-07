/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import debounce from 'lodash.debounce';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Chart, ListVisual } from './Visuals';
import * as COLORS from '../constants';
import { useDashboardReportDataWithConfig } from '../api/queries';
import { FlexEnd } from './Layout';
import { I18n, useUrlParams } from '../utils';
import { useUpdateFavouriteDashboardItem } from '../api';

const Container = styled.div`
  width: 55rem;
  max-width: 100%;
  border: 1px solid ${props => props.theme.palette.grey['400']};
  margin-bottom: 1.8rem;
  border-radius: 3px;

  .recharts-cartesian-axis.recharts-xAxis .recharts-label {
    display: none;
  }
`;

const Footer = styled(FlexEnd)`
  padding: 1.25rem 1.875rem;
  background: ${COLORS.GREY_F9};
  border-top: 1px solid ${props => props.theme.palette.grey['400']};
`;

export const DashboardReport = React.memo(
  ({ name, exportOptions, reportCode, startDate, endDate, isEnlarged, isExporting }) => {
    const { search } = useLocation();
    const { locale, entityCode } = useUrlParams();

    const { data, isLoading, isFetching, isError, error } = useDashboardReportDataWithConfig({
      entityCode,
      reportCode,
      startDate,
      endDate,
    });

    const { reportData, dashboardItemConfig: config, reportCodes } = data;
    const Visual = config?.type === 'list' ? ListVisual : Chart;
    const Wrapper = isEnlarged ? React.Fragment : Container;
    const drillDownPathname = `/${locale}/${entityCode}/dashboard`;

    const [isFavourite, setIsFavourite] = useState(config.isFavourite);
    useEffect(() => {
      setIsFavourite(config.isFavourite);
    }, [config.isFavourite]);

    const updateFavouriteDashboardItem = useUpdateFavouriteDashboardItem();
    /**
     * Enable lodash.debounce in onChange function.
     * Every time the component is re-evaluated, the local variables gets initialized again, including the timer in debounce().
     * Use useRef() hook as value returned by useRef() does not get re-evaluated every time the functional component is executed.
     * https://stackoverflow.com/a/64856090
     */
    const updateFavouriteDashboardItemDebounced = useRef(
      debounce(updateFavouriteDashboardItem, 1000),
    );

    const handleFavouriteStatusChange = () => {
      const newFavouriteStatus = !isFavourite;
      updateFavouriteDashboardItemDebounced.current(
        newFavouriteStatus,
        config.code,
        config.dashboardCode,
        entityCode,
      );
      setIsFavourite(newFavouriteStatus);
    };

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
          exportOptions={exportOptions}
          drilldownPathname={drillDownPathname}
          reportCodes={reportCodes}
          isEnlarged={isEnlarged}
          isFavourite={isFavourite}
          handleFavouriteStatusChange={handleFavouriteStatusChange}
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
              <I18n t="dashboards.seeMore" />
            </Button>
          </Footer>
        )}
      </Wrapper>
    );
  },
);

DashboardReport.propTypes = {
  exportOptions: PropTypes.object,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  name: PropTypes.string,
  reportCode: PropTypes.string,
  isEnlarged: PropTypes.bool,
  isExporting: PropTypes.bool,
};

DashboardReport.defaultProps = {
  exportOptions: null,
  startDate: null,
  endDate: null,
  reportCode: null,
  name: null,
  isEnlarged: false,
  isExporting: false,
};
