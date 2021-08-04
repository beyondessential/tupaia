/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FlexSpaceBetween } from '../Layout';
import { ColorCircle } from './ColorCircle';
import { HeaderRow, SubHeaderRow, StandardRow, DrillDownRow } from './Rows';
import { FetchLoader } from '../FetchLoader';

const Container = styled.div`
  border-radius: 3px;
  overflow: hidden;
  min-height: 400px;
  height: ${props => (props.isLoading ? '400px' : 'auto')};
  background: #f9f9f9;
`;

const Footer = styled(FlexSpaceBetween)`
  padding: 2rem 1rem;
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

const processData = (config, data, drillDowns) => {
  let parentCode = null;

  return data?.map(item => {
    let rowType = 'standard';
    let displayConfig = null;
    let drillDownCode = null;

    if (!item.parent) {
      rowType = 'header';
      parentCode = item.code;
    }

    if (item.parent === parentCode) {
      rowType = 'subheader';
    }

    if (config?.drillDown?.itemCodeByEntry[item.code] !== undefined) {
      drillDownCode = config?.drillDown?.itemCodeByEntry[item.code];

      // check that the drill down config exists before trying to render a drilldown row
      if (drillDowns.find(d => d.code === drillDownCode)) {
        rowType = 'drilldown';
      }
    }

    if (item.statistic !== undefined) {
      displayConfig = getDisplayConfig(config, item.statistic);
    }

    return { ...item, rowType, valueType: config.valueType, displayConfig, drillDownCode };
  });
};

export const ListVisual = ({
  viewContent,
  isLoading,
  dashboard,
  isError,
  error,
  drillDowns,
  DrillDownComponent,
}) => {
  const { data, ...config } = viewContent;

  const list = processData(config, data, drillDowns);

  return (
    <Container isLoading={isLoading}>
      <FetchLoader isLoading={isLoading} isError={isError} error={error}>
        {list?.map(({ rowType, valueType, label, displayConfig, drillDownCode }, index) => {
          const ValueComponent = VALUE_TYPE_COMPONENTS[valueType];

          if (rowType === 'drilldown') {
            return (
              <DrillDownRow
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                label={label}
                drillDownCode={drillDownCode}
                dashboard={dashboard}
                drillDowns={drillDowns}
                DrillDownComponent={DrillDownComponent}
              >
                <ValueComponent displayConfig={displayConfig} />
              </DrillDownRow>
            );
          }

          const RowComponent = ROW_TYPE_COMPONENTS[rowType];

          return (
            <RowComponent
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              label={label}
            >
              <ValueComponent displayConfig={displayConfig} />
            </RowComponent>
          );
        })}
        <Footer />
      </FetchLoader>
    </Container>
  );
};

ListVisual.propTypes = {
  viewContent: PropTypes.object,
  dashboard: PropTypes.shape({
    dashboardCode: PropTypes.string.isRequired,
    dashboardName: PropTypes.string.isRequired,
  }).isRequired,
  drillDowns: PropTypes.array,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.string,
  DrillDownComponent: PropTypes.any.isRequired,
};

ListVisual.defaultProps = {
  viewContent: null,
  drillDowns: [],
  isLoading: false,
  isFetching: false,
  isError: false,
  error: null,
};
