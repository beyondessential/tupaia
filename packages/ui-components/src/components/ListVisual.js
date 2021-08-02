/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { FlexStart, FlexSpaceBetween } from './Layout';

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

    if (!item.parent) {
      rowType = 'header';
      parentCode = item.code;
    }

    if (item.parent === parentCode) {
      rowType = 'subheader';
    }

    if (item.statistic !== undefined) {
      displayConfig = config.listConfig[item.statistic];
    }

    return { ...item, rowType, valueType: config.valueType, displayConfig };
  });
};

export const ListVisual = ({ config, data }) => {
  const list = processData(config, data);
  return (
    <Container>
      {list.map(({ rowType, valueType, label, displayConfig }, index) => {
        const RowComponent = ROW_TYPE_COMPONENTS[rowType];
        const ValueComponent = VALUE_TYPE_COMPONENTS[valueType];
        return (
          // eslint-disable-next-line react/no-array-index-key
          <RowComponent key={index} label={label}>
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
