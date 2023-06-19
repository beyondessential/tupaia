/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { useParams } from 'react-router';
import { Tabs } from './Tabs';
import { useEntity } from '../../api/queries';

const Wrapper = styled.div`
  @media screen and (min-width: ${({ theme }) => theme.breakpoints.values.md}px) {
    display: none;
  }
`;

const EntityName = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1.2rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightBold};
  margin: 1.2rem 0;
  text-align: center;
`;

export const TabLayout = () => {
  const { entityCode } = useParams();
  const { data } = useEntity(entityCode);
  return (
    <Wrapper>
      {data && <EntityName>{data.name}</EntityName>}
      <Tabs />
    </Wrapper>
  );
};
