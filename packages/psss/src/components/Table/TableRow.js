/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import styled from 'styled-components';
import { ExpandableTableRow } from '@tupaia/ui-components';
import * as COLORS from '../../constants/colors';

export const SimpleTableRow = styled(ExpandableTableRow)`
  border: none;

  .MuiTableCell-root {
    font-size: 0.875rem;
    line-height: 1rem;
    border: none;
    padding: 0.9rem 0;
    border-bottom: 1px solid ${COLORS.GREY_DE};
    height: auto;
    color: ${props => props.theme.palette.text.primary};

    &:first-child {
      text-align: left;
    }

    .MuiInputBase-input {
      text-align: center;
    }
  }

  &:hover {
    background: none;
    cursor: auto;
  }

  &:last-child {
    .MuiTableCell-root {
      border-bottom: none;
    }
  }
`;

export const BorderlessTableRow = styled(SimpleTableRow)`
  .MuiTableCell-root {
    font-size: 0.9375rem;
    line-height: 1.125rem;
    border: none;
    padding: 0 1.2rem;
    height: 2.6rem;
    color: ${props => props.theme.palette.text.primary};
  }
`;

export const DottedTableRow = styled(SimpleTableRow)`
  .MuiTableCell-root {
    font-size: 0.875rem;
    border-bottom: 1px dashed ${COLORS.GREY_DE};
    line-height: 1rem;
    padding: 0.9rem 0;
    color: ${props => props.theme.palette.text.primary};
    height: auto;
  }
`;
