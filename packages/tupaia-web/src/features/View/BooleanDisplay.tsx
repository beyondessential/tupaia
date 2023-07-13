/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { CheckCircle, Cancel } from '@material-ui/icons';
import { MultiValueRowViewConfig, MultiValueViewConfig } from '@tupaia/types';

const PositiveIcon = styled(CheckCircle)<{
  $color?: string;
}>`
  color: ${props => props.$color || '#22c7fc'};
  height: 1.25rem;
`;

const NegativeIcon = styled(Cancel)<{
  $color?: string;
}>`
  color: ${props => props.$color || '#c7c7c7'};
  height: 1.25rem;
`;

interface BooleanDisplayProps {
  value: number;
  metadata?: {
    presentationOptions?: MultiValueViewConfig['presentationOptions'];
  };
}

export const BooleanDisplay = ({ value, metadata = {} }: BooleanDisplayProps) => {
  const { presentationOptions = {} } = metadata;
  const isPositive = value > 0;
  const Icon = isPositive ? PositiveIcon : NegativeIcon;
  const colorKey = isPositive ? 'yes' : 'no';
  const color = presentationOptions[colorKey]?.color;

  return <Icon $color={color} />;
};
