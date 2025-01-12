import React from 'react';
import { TableHeader } from '@tupaia/ui-components';
import styled from 'styled-components';
import * as COLORS from '../../constants/colors';

const TABLE_HEADER_PADDING = '19px';

/*
 * The table header is designed to be used with the tables in Table.js
 * The tables have inner padding and this component is a full width table header
 * It is not possible to add padding to most table elements so here the impression of table
 * padding is added wtih before and afters
 */
const StyledTableHeader = styled(TableHeader)`
  background: ${COLORS.GREY_F1};

  .MuiTableCell-head {
    position: relative;
    height: auto;
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
    border-top: 1px solid ${props => props.theme.palette.grey['400']};
    border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.6875rem;
    line-height: 0.8rem;
    color: ${props => props.theme.palette.text.secondary};

    &:first-child,
    &:last-child {
      &:before {
        position: absolute;
        top: -1px;
        bottom: -1px;
        content: '';
        background: ${COLORS.GREY_F1};
        width: ${TABLE_HEADER_PADDING};
        border-top: 1px solid ${props => props.theme.palette.grey['400']};
        border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
      }
      padding-right: 0;
      padding-left: 0;
    }

    &:first-child {
      text-align: left;

      &:before {
        left: -${TABLE_HEADER_PADDING};
      }
    }

    &:last-child {
      &:before {
        right: -${TABLE_HEADER_PADDING};
      }
    }
  }
`;

export const GreyTableHeader = props => {
  return <StyledTableHeader {...props} />;
};
