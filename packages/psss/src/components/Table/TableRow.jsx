import styled, { css } from 'styled-components';
import { TableRow } from '@tupaia/ui-components';
import * as COLORS from '../../constants/colors';

const SimpleTableRowStyles = css`
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

export const SimpleTableRow = styled(TableRow)`
  ${SimpleTableRowStyles}
`;

export const BorderlessTableRowStyles = css`
  ${SimpleTableRowStyles}

  .MuiTableCell-root {
    font-size: 0.9375rem;
    line-height: 1.125rem;
    border: none;
    padding: 0 1.2rem;
    height: 2.6rem;
    color: ${props => props.theme.palette.text.primary};
  }
`;

export const BorderlessTableRow = styled(SimpleTableRow)`
  ${BorderlessTableRowStyles}
`;

const DottedTableRowStyles = css`
  ${SimpleTableRowStyles}

  .MuiTableCell-root {
    font-size: 0.875rem;
    border-bottom: 1px dashed ${COLORS.GREY_DE};
    line-height: 1rem;
    padding: 0.9rem 0;
    color: ${props => props.theme.palette.text.primary};
    height: auto;
  }
`;

export const DottedTableRow = styled(SimpleTableRow)`
  ${DottedTableRowStyles}
`;
