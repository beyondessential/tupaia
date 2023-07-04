/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { TableCell, lighten, Button } from '@material-ui/core';
import styled from 'styled-components';
import { PresentationOptions } from '@tupaia/types';
import { getIsUsingDots, getPresentationOption, hexToRgba } from './utils';

export const Dot = styled.div<{ $color?: string }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: 0.375rem solid
    ${({ theme, $color }) =>
      theme.palette.background.default === 'transparent'
        ? 'transparent'
        : hexToRgba(theme.palette.background.default, 0.8)};
  margin: 0 auto;
`;

const DataCell = styled(TableCell)`
  vertical-align: middle;
  text-align: center;
  position: relative;
  z-index: 1;
  padding: 0;
  height: 100%;
  &:hover {
    &:before,
    &:after {
      content: '';
      position: absolute;
      z-index: -1;
      pointer-events: none;
    }
    &:before {
      // do a highlight effect for the column when hovering over a cell
      // fill with transparent black, and go extra tall to cover the whole column. Table overflow:hidden handles overflows
      background-color: rgba(0, 0, 0, 0.2);
      left: 0;
      top: -5000px;
      height: 10000px;
      width: 100%;
    }
    &:after {
      // do a highlight effect for the row when hovering over a cell
      // fill with transparent white, and go extra wide to cover the whole width. Table overflow:hidden handles overflows
      background-color: rgba(255, 255, 2555, 0.1);
      top: 0;
      left: -5000px;
      width: 10000px;
      height: 100%;
    }
  }
`;

const DataCellContent = styled.div``;

const ExpandCellButton = styled(Button)`
  width: 100%;
  height: 100%;
  padding: 0;
`;

interface MatrixRowProps {
  value: any;
  presentationOptions: PresentationOptions;
}

export const MatrixCell = ({ value, presentationOptions = {} }: MatrixRowProps) => {
  const isDots = getIsUsingDots(presentationOptions);
  const { showRawValue } = presentationOptions;
  const presentation = getPresentationOption(presentationOptions, value);
  return (
    <DataCell>
      <DataCellContent as={showRawValue ? ExpandCellButton : 'div'}>
        {isDots ? (
          <Dot $color={presentation?.color} aria-label={`${presentation?.description}: ${value}`} />
        ) : (
          value
        )}
      </DataCellContent>
    </DataCell>
  );
};
