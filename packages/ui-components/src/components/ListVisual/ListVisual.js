/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';
import { ColorCircle } from './ColorCircle';
import { HeaderRow, SubHeaderRow, StandardRow, LinkRow } from './Rows';
import { FetchLoader } from '../FetchLoader';
import { getIsChartData, getNoDataString } from '../Chart';
import { SmallAlert } from '../Alert';

const Container = styled.div`
  position: relative;
  border-radius: 3px;
  overflow: hidden;
  min-height: 400px;
  border: 1px solid ${props => (props.isEnlarged ? props.theme.palette.grey['400'] : 'none')};
  border-collapse: collapse;
  height: ${props => (props.isLoading ? '400px' : 'auto')};
  background: #f9f9f9;
`;

const ROW_TYPE_COMPONENTS = {
  header: HeaderRow,
  subheader: SubHeaderRow,
  standard: StandardRow,
};

const VALUE_TYPE_COMPONENTS = {
  color: ColorCircle,
};

const DEFAULT_LIST_CONFIGS = {
  COLOR: {
    0: { color: '#ffc701', label: 'Yellow' },
    1: { color: '#02B851', label: 'Green' },
    '-1': { color: '#D13333', label: 'Red' },
  },
};

const getDisplayConfig = ({ valueType, listConfig }, statistic) => {
  switch (valueType) {
    case 'color':
      if (listConfig) {
        return listConfig[statistic];
      }
      return DEFAULT_LIST_CONFIGS.COLOR[statistic] || null;
    default:
      return null;
  }
};

const processData = (config, data, reportCodes) => {
  let parentCode = null;

  return data?.map(item => {
    let rowType = 'standard';
    let displayConfig = null;
    let drillDownReportCode = null;

    if (!item.parent) {
      rowType = 'header';
      parentCode = item.code;
    }

    if (item.parent === parentCode) {
      rowType = 'subheader';
    }

    if (config?.drillDown?.itemCodeByEntry[item.code] !== undefined) {
      const drillDownCode = config?.drillDown?.itemCodeByEntry[item.code];

      // check that the drill down config exists before trying to render a drilldown row
      if (reportCodes[drillDownCode] !== undefined) {
        drillDownReportCode = reportCodes[drillDownCode];
      }
    }

    if (item.statistic !== undefined) {
      displayConfig = getDisplayConfig(config, item.statistic);
    }

    return { ...item, rowType, valueType: config.valueType, displayConfig, drillDownReportCode };
  });
};

// eslint-disable-next-line react/prop-types
const DrillDownLink = ({ pathname, reportCode, children }) => {
  const { search } = useLocation();
  return (
    <LinkRow
      to={{
        pathname,
        search: `${search}&reportCode=${reportCode}`,
      }}
    >
      {children}
    </LinkRow>
  );
};

const NoData = styled(SmallAlert)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const ListVisual = React.memo(
  ({ viewContent, isLoading, isError, error, drilldownPathname, reportCodes, isEnlarged }) => {
    const { data, ...config } = viewContent;

    const list = processData(config, data, reportCodes);

    if (!isLoading && !getIsChartData(viewContent)) {
      return (
        <Container>
          <NoData severity="info" variant="standard">
            {getNoDataString(viewContent)}
          </NoData>
        </Container>
      );
    }

    return (
      <Container isLoading={isLoading} isEnlarged={isEnlarged}>
        <FetchLoader isLoading={isLoading} isError={isError} error={error}>
          {list?.map(({ rowType, valueType, label, displayConfig, drillDownReportCode }, index) => {
            const ValueComponent = VALUE_TYPE_COMPONENTS[valueType];
            const RowComponent = ROW_TYPE_COMPONENTS[rowType];

            const Row = () => (
              <RowComponent label={label}>
                <ValueComponent displayConfig={displayConfig} />
              </RowComponent>
            );

            return drillDownReportCode ? (
              <DrillDownLink
                key={index}
                pathname={drilldownPathname}
                reportCode={drillDownReportCode}
              >
                <Row />
              </DrillDownLink>
            ) : (
              <Row key={index} />
            );
          })}
        </FetchLoader>
      </Container>
    );
  },
);

ListVisual.propTypes = {
  drilldownPathname: PropTypes.string,
  viewContent: PropTypes.object,
  reportCodes: PropTypes.object,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  isError: PropTypes.bool,
  isEnlarged: PropTypes.bool,
  error: PropTypes.string,
};

ListVisual.defaultProps = {
  drilldownPathname: null,
  viewContent: null,
  reportCodes: null,
  isLoading: false,
  isFetching: false,
  isError: false,
  isEnlarged: false,
  error: null,
};
