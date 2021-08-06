/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import { FlexSpaceBetween } from '../Layout';

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

const LinkRow = styled(Row)`
  text-decoration: none;
  color: initial;

  &:hover .MuiTypography-root {
    text-decoration: underline;
    color: ${props => props.theme.palette.primary.main};
  }
`;

export const DrillDownRow = ({ label, entityCode, reportCode, children }) => {
  const { search } = useLocation();
  return (
    <LinkRow
      component={RouterLink}
      to={{
        pathname: `/${entityCode}/dashboard`,
        search: `${search}&reportCode=${reportCode}`,
      }}
    >
      <Cell>
        <Text>{label}</Text>
      </Cell>
      {children}
    </LinkRow>
  );
};

DrillDownRow.propTypes = {
  label: PropTypes.string.isRequired,
  entityCode: PropTypes.string.isRequired,
  reportCode: PropTypes.string.isRequired,
  children: PropTypes.any.isRequired,
};
