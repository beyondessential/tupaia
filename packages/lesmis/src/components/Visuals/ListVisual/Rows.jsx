import React from 'react';
import styled from 'styled-components';
import Typography from '@material-ui/core/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { FlexSpaceBetween } from '@tupaia/ui-components';

const Heading = styled(Typography)`
  font-size: 1.125rem;
  line-height: 1.5rem;
`;

const Text = styled(Typography)`
  font-size: 0.875rem;
  line-height: 1.125rem;
`;

const SubHeading = styled(Text)`
  font-weight: 500;
`;

const Row = styled(FlexSpaceBetween)`
  background: #f9f9f9;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  width: 100%;
  padding: 0;
  text-align: left;

  &:last-child {
    margin-bottom: -1px;
  }

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

export const LinkRow = styled(RouterLink)`
  display: flex;
  text-decoration: none;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  color: inherit;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    cursor: pointer;

    .MuiTypography-root {
      text-decoration: underline;
      color: ${props => props.theme.palette.primary.main};
    }
  }
`;
