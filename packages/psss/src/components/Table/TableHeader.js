/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { TableHeader } from '@tupaia/ui-components';
import styled from 'styled-components';

const fakeHeaderBackgroundColor = '#f1f1f1';

const StyledTableHeader = styled(TableHeader)`
  background: ${fakeHeaderBackgroundColor};

  .MuiTableCell-head {
    position: relative;
    height: auto;
    padding-top: 0.8rem;
    padding-bottom: 0.8rem;
    border-top: 1px solid ${props => props.theme.palette.grey['400']};
    border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
    font-weight: 600;
    text-transform: uppercase;
    font-size: 11px;
    line-height: 13px;
    color: ${props => props.theme.palette.text.secondary};

    &:first-child,
    &:last-child {
      &:before {
        position: absolute;
        top: -1px;
        bottom: -1px;
        content: '';
        background: #f1f1f1;
        width: 19px;
        border-top: 1px solid ${props => props.theme.palette.grey['400']};
        border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
      }
      padding-right: 0;
      padding-left: 0;
    }

    &:first-child {
      text-align: left;

      &:before {
        left: -19px;
      }
    }

    &:last-child {
      &:before {
        right: -19px;
      }
    }
  }
`;

export const GreyTableHeader = props => {
  return <StyledTableHeader {...props} />;
};
