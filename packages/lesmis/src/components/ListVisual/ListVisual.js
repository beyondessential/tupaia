/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FlexSpaceBetween } from '../Layout';
import { Circle } from './Circle';
import { HeaderRow, SubHeaderRow, StandardRow, DrillDownRow } from './Rows';

const Container = styled.div`
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
`;

const Footer = styled(FlexSpaceBetween)`
  padding: 2rem 1rem;
  background: #f9f9f9;
`;

const ROW_TYPE_COMPONENTS = {
  header: HeaderRow,
  subheader: SubHeaderRow,
  standard: StandardRow,
  drilldown: DrillDownRow,
};

const VALUE_TYPE_COMPONENTS = {
  color: Circle,
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

const processData = (config, data) => {
  let parentCode = null;

  return data.map(item => {
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
      rowType = 'drilldown';
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
  drillDowns,
  entityCode,
  dashboardCode,
  dashboardName,
}) => {
  if (isLoading) {
    return null;
  }

  const { data, ...config } = viewContent;

  const list = processData(config, data, drillDowns);

  return (
    <Container>
      {list.map(({ rowType, valueType, label, displayConfig, drillDownCode }, index) => {
        const RowComponent = ROW_TYPE_COMPONENTS[rowType];
        const ValueComponent = VALUE_TYPE_COMPONENTS[valueType];
        return (
          <RowComponent
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            label={label}
            drillDownCode={drillDownCode}
            drillDowns={drillDowns}
            entityCode={entityCode}
            dashboardCode={dashboardCode}
            dashboardName={dashboardName}
          >
            <ValueComponent displayConfig={displayConfig} />
          </RowComponent>
        );
      })}
      <Footer>
        <div>Export</div>
      </Footer>
    </Container>
  );
};

ListVisual.propTypes = {
  viewContent: PropTypes.object,
  isLoading: PropTypes.bool,
  isFetching: PropTypes.bool,
  isEnlarged: PropTypes.bool,
  isError: PropTypes.bool,
  error: PropTypes.string,
  name: PropTypes.string,
};

ListVisual.defaultProps = {
  viewContent: null,
  isLoading: false,
  isFetching: false,
  isEnlarged: false,
  isError: false,
  error: null,
  name: null,
};
