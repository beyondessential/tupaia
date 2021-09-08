/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { FlexSpaceBetween, FlexStart } from '../Layout';

const Header = styled(FlexSpaceBetween)`
  padding: 1.25rem 1.875rem;
  border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 500;
  font-size: 1.125rem;
  line-height: 1.3rem;
  margin-right: 1rem;
`;

export const VisualHeader = ({ name, isLoading, children }) => {
  return (
    <Header>
      <FlexStart>
        <Title>{name}</Title>
        {isLoading && <CircularProgress size={30} />}
      </FlexStart>
      {children}
    </Header>
  );
};
