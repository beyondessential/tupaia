/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { SingleTaskResponse } from '../../types';
import { displayDate } from '../../utils';
import { getDisplayRepeatSchedule } from './utils';
import { StatusPill } from './StatusPill';

const MetaDataContainer = styled.div`
  padding-inline: 1rem;
  padding-block-start: 1.1rem;
  padding-block-end: 1.5rem;
  border: 1px solid ${({ theme }) => theme.palette.divider};
  border-radius: 4px;
  margin-block-end: 1.2rem;
`;

const ItemWrapper = styled.div`
  &:not(:last-child) {
    margin-block-end: 1.2rem;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h3',
})`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: normal;
  margin-block-end: 0.2rem;
`;

const Value = styled(Typography)`
  font-size: 0.875rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  &:first-child {
    width: 58%;
    padding-inline-end: 1rem;
  }
  &:last-child {
    width: 42%;
    border-left: 1px solid ${({ theme }) => theme.palette.divider};
    padding-inline-start: 1rem;
  }
  ${ItemWrapper} {
    height: 2.5rem;
  }
`;

const Row = styled.div`
  display: flex;
  margin-block-end: 1.2rem;
`;

export const TaskSummary = ({ task }: { task: SingleTaskResponse }) => {
  const displayRepeatSchedule = getDisplayRepeatSchedule(task);
  return (
    <MetaDataContainer>
      <Row>
        <Column>
          <ItemWrapper>
            <Title>Survey</Title>
            <Value>{task.survey.name}</Value>
          </ItemWrapper>
          <ItemWrapper>
            <Title>Repeating task</Title>
            <Value>{displayRepeatSchedule}</Value>
          </ItemWrapper>
        </Column>
        <Column>
          <ItemWrapper>
            <Title>Entity</Title>
            <Value>{task.entity.name}</Value>
          </ItemWrapper>
          <ItemWrapper>
            <Title>Due date</Title>
            <Value>{displayDate(task.taskDueDate)}</Value>
          </ItemWrapper>
        </Column>
      </Row>
      <ItemWrapper>
        <Title>Status</Title>
        <StatusPill status={task.taskStatus} />
      </ItemWrapper>
    </MetaDataContainer>
  );
};
