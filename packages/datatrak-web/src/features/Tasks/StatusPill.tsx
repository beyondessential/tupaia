/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { TaskStatus } from '@tupaia/types';
import React from 'react';
import styled from 'styled-components';

const Pill = styled.span<{
  $color: string;
}>`
  background-color: ${({ $color }) => `${$color}22`};
  color: ${({ $color }) => $color};
  font-size: 0.7rem;
  padding-inline: 0.7rem;
  padding-block: 0.3rem;
  border-radius: 20px;
  div:has(&) {
    overflow: visible;
  }
`;

export const REPEATING_STATUS = 'repeating';

export const STATUS_VALUES = {
  [TaskStatus.to_do]: {
    label: 'To do',
    color: '#1172D1',
  },
  [TaskStatus.overdue]: {
    label: 'Overdue',
    color: '#F76853',
  },
  [REPEATING_STATUS]: {
    label: 'Repeating',
    color: '#4101C9',
  },
  [TaskStatus.completed]: {
    label: 'Complete',
    color: '#19934E',
  },
  [TaskStatus.cancelled]: {
    label: 'Cancelled',
    color: '#898989',
  },
};

export const StatusPill = ({ status }) => {
  const { label, color } = STATUS_VALUES[status];
  return <Pill $color={color}>{label}</Pill>;
};
