/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { TableRow, ControlledExpandableTableRow } from '@tupaia/ui-components';
import * as COLORS from '../../theme/colors';

export const StyledBorderlessTableRow = styled(ControlledExpandableTableRow)`
  .MuiTableCell-root {
    font-size: 15px;
    line-height: 18px;
    border: none;
    padding: 0;
    text-align: center;
    height: 42px;
    color: ${props => props.theme.palette.text.primary};

    &:first-child {
      padding-left: 1.25rem;
      text-align: left;
    }
  }
`;

export const BorderlessTableRow = props => <StyledBorderlessTableRow {...props} expanded />;

export const DottedTableRow = styled(TableRow)`
  .MuiTableCell-root {
    font-size: 14px;
    line-height: 16px;
    padding: 0.8rem 1rem;
    border-bottom: 1px dashed ${COLORS.GREY_DE};
    color: ${props => props.theme.palette.text.primary};
    text-align: left;
    height: auto;
  }
`;

export const SimpleTableRow = styled(TableRow)`
  .MuiTableCell-root {
    font-size: 14px;
    line-height: 16px;
    border-bottom: 1px solid ${COLORS.GREY_DE};
    padding: 0.8rem 1rem;
    text-align: left;
    height: auto;
    color: ${props => props.theme.palette.text.primary};
  }
`;
