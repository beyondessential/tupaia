/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Task } from '../../../types';
import { StatusPill } from '../StatusPill';
import { useEntityByCode } from '../../../api';

const Container = styled.div`
  border: 1px solid ${props => props.theme.palette.divider};
  padding-block: 1.2rem;
  padding-inline: 1rem;
  border-radius: 4px;
`;

const Title = styled(Typography).attrs({
  variant: 'h2',
  color: 'textSecondary',
})`
  font-size: 0.875rem;
  font-weight: normal;
  margin-block-end: 0.2rem;
`;

const Value = styled(Typography)`
  font-weight: ${props => props.theme.typography.fontWeightMedium};
  font-size: 0.875rem;
`;

const DataWrapper = styled.div`
  &:not(:first-child) {
    margin-block-start: 1rem;
  }
`;

const Row = styled(DataWrapper)`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Pin = styled.img.attrs({
  src: '/tupaia-pin.svg',
  ['aria-hidden']: true, // this pin is not of any use to the screen reader, so hide from the screen reader
})`
  width: auto;
  height: 1rem;
  margin-inline-end: 0.5rem;
`;

const CountryWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const TaskMetadata = ({ task }: { task?: Task }) => {
  const { data: country } = useEntityByCode(task?.entity?.countryCode, {
    enabled: !!task?.entity?.countryCode,
  });
  if (!task) return null;
  const { survey, entity, taskStatus } = task;

  return (
    <Container>
      <Row>
        <DataWrapper>
          <Title>Survey</Title>
          <Value>{survey?.name}</Value>
        </DataWrapper>
        <CountryWrapper>
          <Pin />
          <Value>{country?.name}</Value>
        </CountryWrapper>
      </Row>

      <DataWrapper>
        <Title>Entity</Title>
        <Value>
          {country?.name} | {entity?.name}
        </Value>
      </DataWrapper>
      <DataWrapper>
        <Title>Status</Title>
        <StatusPill status={taskStatus} />
      </DataWrapper>
    </Container>
  );
};
