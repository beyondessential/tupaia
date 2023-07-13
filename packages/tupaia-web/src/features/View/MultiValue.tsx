/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Table, TableCell as MuiTableCell, TableRow, TableBody } from '@material-ui/core';
import { CheckCircle, Cancel } from '@material-ui/icons';
import { MultiValueViewConfig } from '@tupaia/types';
import { ViewDataItem } from '../../types';

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
  value: boolean;
  config?: {
    presentationOptions?: MultiValueViewConfig['presentationOptions'];
  };
}

const BooleanDisplay = ({ value, config = {} }: BooleanDisplayProps) => {
  const { presentationOptions = {} } = config;
  const Icon = value ? PositiveIcon : NegativeIcon;
  const colorKey = value ? 'yes' : 'no';
  const color = presentationOptions[colorKey]?.color;
  return <Icon $color={color} />;
};
interface MultiValueProps {
  data?: (Omit<ViewDataItem, 'value'> & {
    value: string | number | boolean;
  })[];
  config: MultiValueViewConfig;
}

const TableCell = styled(MuiTableCell)`
  border: none;
  padding: 0.375rem 0;
  font-size: 1rem;
  line-height: 1.2;
  &:nth-child(2) {
    color: ${({ theme }) => theme.dashboardItem.multiValue.data};
    font-weight: ${({ theme }) => theme.typography.fontWeightBold};
    text-align: right;
  }
`;

export const MultiValue = ({ data, config }: MultiValueProps) => {
  const { valueType } = config;
  return (
    <Table>
      <TableBody>
        {data?.map((datum, i) => (
          <TableRow key={i}>
            <TableCell component="th">{datum.name}</TableCell>
            <TableCell>
              {valueType === 'boolean' ? (
                <BooleanDisplay value={datum.value as boolean} config={config} />
              ) : (
                datum.value
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
