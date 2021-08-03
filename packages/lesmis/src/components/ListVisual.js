/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { DashboardReportModal } from './DashboardReportModal';
import { FlexStart, FlexSpaceBetween } from './Layout';
import { useDashboardData } from '../api/queries';
import { useUrlParams } from '../utils';

const Container = styled.div`
  border: 1px solid ${props => props.theme.palette.grey['400']};
  border-radius: 3px;
`;

const Heading = styled(Typography)`
  font-size: 18px;
  line-height: 24px;
`;

const Text = styled(Typography)`
  font-size: 14px;
  line-height: 18px;
`;

const SubHeading = styled(Text)`
  font-weight: 500;
`;

const Row = styled(FlexSpaceBetween)`
  background: #f9f9f9;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};

  &:nth-child(even) {
    background: #f1f1f1;
  }
`;

const Cell = styled.div`
  padding: 1rem;
  border-right: 1px solid ${props => props.theme.palette.grey['400']};
  flex: 1;
`;

const HeaderCell = styled(Cell)`
  padding: 2rem 1rem;
`;

const CircleCell = styled.div`
  display: flex;
  justify-content: center;
  width: 115px;
  padding: 0;
  border-right: none;
`;

const Circle = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background-color: ${props => props.color};
  border: 5px solid ${props => props.border};
`;

const HeaderRow = ({ label, children }) => (
  <Row>
    <HeaderCell>
      <Heading>{label}</Heading>
    </HeaderCell>
    {children}
  </Row>
);

const SubHeaderRow = ({ label, children }) => (
  <Row style={{ background: '#FFEFEF' }}>
    <Cell>
      <SubHeading>{label}</SubHeading>
    </Cell>
    {children}
  </Row>
);

const StandardRow = ({ label, children }) => (
  <Row>
    <Cell>
      <Text>{label}</Text>
    </Cell>
    {children}
  </Row>
);

const DrillDownRow = ({
  label,
  drillDownCode,
  drillDowns,
  entityCode,
  dashboardCode,
  dashboardName,
  children,
}) => {
  const config = drillDowns.find(d => d.code === drillDownCode);
  console.log('config', config);

  return (
    <Row>
      <Cell>
        <Text>{label}</Text>
        <DashboardReportModal
          buttonText="drilldown"
          name={config.name}
          entityCode={entityCode}
          dashboardCode={dashboardCode}
          dashboardName={dashboardName}
          reportCode={config.reportCode}
          periodGranularity={config.periodGranularity}
          viewConfig={config}
        />
      </Cell>
      {children}
    </Row>
  );
};

const CircleComponent = ({ displayConfig }) => {
  if (!displayConfig) {
    return <CircleCell>-</CircleCell>;
  }

  const { color, border } = displayConfig;

  return (
    <CircleCell>
      <Circle color={color} border={border} />
    </CircleCell>
  );
};

const ROW_TYPE_COMPONENTS = {
  header: HeaderRow,
  subheader: SubHeaderRow,
  standard: StandardRow,
  drilldown: DrillDownRow,
};

const VALUE_TYPE_COMPONENTS = {
  color: CircleComponent,
};

const Footer = styled(FlexSpaceBetween)`
  padding: 2rem 1rem;
  background: #f9f9f9;
`;

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
      displayConfig = config.listConfig[item.statistic];
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
          // eslint-disable-next-line react/no-array-index-key
          <RowComponent
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
