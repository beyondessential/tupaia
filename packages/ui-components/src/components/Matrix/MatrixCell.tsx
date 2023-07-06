/*
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import { TableCell, Button } from '@material-ui/core';
import styled from 'styled-components';
import { getIsUsingDots, getPresentationOption, hexToRgba } from './utils';
import { ACTION_TYPES, MatrixContext, MatrixDispatchContext } from './MatrixContext';
import { MatrixRowType } from '../../types';

export const Dot = styled.div<{ $color?: string }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  border: 0.375rem solid
    ${({ theme }) =>
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
  &:before,
  &:after {
    content: '';
    position: absolute;
    z-index: -1;
    pointer-events: none;
  }
  &:hover {
    ${Dot} {
      transform: scale(1.2);
    }
  }
`;

const DataCellContent = styled.div`
  padding: 0.25rem;
`;

const ExpandCellButton = styled(Button)`
  width: 100%;
  height: 100%;
  padding: 0;
`;

export const MatrixCell = ({ value }: { value: any }) => {
  const { presentationOptions = {} } = useContext(MatrixContext);
  const isDots = getIsUsingDots(presentationOptions);
  const { showRawValue } = presentationOptions;
  const presentation = getPresentationOption(presentationOptions, value);
  const displayValue = isDots ? (
    <Dot $color={presentation?.color} aria-label={`${presentation?.description}: ${value}`} />
  ) : (
    value
  );

  return (
    <DataCell>
      <DataCellContent as={showRawValue ? ExpandCellButton : 'div'}>{displayValue}</DataCellContent>
    </DataCell>
  );
};
