/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { TaskStatus } from '@tupaia/types';
import { theme } from '../../theme';
import { TaskStatusType } from '../../types';

const Pill = styled.span<{
  $color: string;
}>`
  background-color: ${({ $color }) => `${$color}22`};
  color: ${({ $color }) => $color};
  font-size: 0.625rem;
  padding-inline: 0.7rem;
  padding-block: 0.2rem;
  border-radius: 20px;
  .cell-content > div:has(&) {
    overflow: visible;
  }
`;

export const STATUS_VALUES = {
  [TaskStatus.to_do]: {
    label: 'To do',
    color: '#1172D1',
  },
  [TaskStatus.completed]: {
    label: 'Complete',
    color: '#19934E',
  },
  [TaskStatus.cancelled]: {
    label: 'Cancelled',
    color: theme.palette.text.secondary,
  },
  overdue: {
    label: 'Overdue',
    color: theme.palette.error.main,
  },
  repeating: {
    label: 'Repeating',
    color: '#4101C9',
  },
};

export const StatusPill = ({ status }: { status: TaskStatusType }) => {
  if (!status) {
    return null;
  }
  const statusInfo = STATUS_VALUES[status];
  // If the status is not found, return null. This should not happen in practice, but it's a good idea to handle it.
  if (!statusInfo) {
    return null;
  }
  const { label, color } = statusInfo;
  return <Pill $color={color}>{label}</Pill>;
};
