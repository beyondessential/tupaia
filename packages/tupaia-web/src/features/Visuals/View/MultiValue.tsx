/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Table, TableCell as MuiTableCell, TableRow, TableBody } from '@material-ui/core';
import { CheckCircle, Cancel } from '@material-ui/icons';
import { MultiValueViewConfig, ViewConfig } from '@tupaia/types';
import { ViewDataItem } from '../../../types';

const PositiveIcon = styled(CheckCircle)<{
  $color?: string;
}>`
  color: ${({ $color, theme }) => $color || theme.dashboardItem.multiValue.data};
  height: 1.25rem;
`;

const NegativeIcon = styled(Cancel)<{
  $color?: string;
}>`
  color: ${({ $color }) => $color || '#c7c7c7'};
  height: 1.25rem;
`;

interface BooleanDisplayProps {
  value: boolean;
  config?: MultiValueViewConfig;
}

const BooleanDisplay = ({ value, config = {} as MultiValueViewConfig }: BooleanDisplayProps) => {
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
  config: ViewConfig;
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
  const { valueType } = config as MultiValueViewConfig;
  return (
    <Table>
      <TableBody>
        {data?.map((datum, i) => (
          <TableRow key={i}>
            <TableCell component="th">{datum.name}</TableCell>
            <TableCell>
              {valueType === 'boolean' ? (
                <BooleanDisplay
                  value={datum.value as boolean}
                  config={config as MultiValueViewConfig}
                />
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
