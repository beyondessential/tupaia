/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { DashboardReportModal } from '../DashboardReportModal';
import { FlexSpaceBetween } from '../Layout';

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

// eslint-disable-next-line react/prop-types
export const HeaderRow = ({ label, children }) => (
  <Row>
    <HeaderCell>
      <Heading>{label}</Heading>
    </HeaderCell>
    {children}
  </Row>
);

// eslint-disable-next-line react/prop-types
export const SubHeaderRow = ({ label, children }) => (
  <Row style={{ background: '#FFEFEF' }}>
    <Cell>
      <SubHeading>{label}</SubHeading>
    </Cell>
    {children}
  </Row>
);

// eslint-disable-next-line react/prop-types
export const StandardRow = ({ label, children }) => (
  <Row>
    <Cell>
      <Text>{label}</Text>
    </Cell>
    {children}
  </Row>
);

export const DrillDownRow = ({
  label,
  drillDownCode,
  drillDowns,
  entityCode,
  dashboardCode,
  dashboardName,
  children,
}) => {
  const config = drillDowns.find(d => d.code === drillDownCode);

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
