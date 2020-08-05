/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import MuiTableBody from '@material-ui/core/TableBody';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { TableCell, StyledTableRow } from './TableRow';

const ErrorSpan = styled.span`
  color: ${props => props.theme.palette.warning.main};
`;

const getMessage = ({ isLoading, errorMessage, isData, noDataMessage }) => {
  if (isLoading) return 'Loading...';
  if (errorMessage) return errorMessage;
  if (isData === 0) return noDataMessage;
  return null;
};

/*
 * Checks if there is a status message for the table and if so returns it instead of the table body
 */
export const TableMessageProvider = React.memo(
  ({ isLoading, errorMessage, isData, noDataMessage, colSpan, children }) => {
    const message = getMessage({ errorMessage, isLoading, isData, noDataMessage });
    if (message) {
      return (
        <MuiTableBody>
          <StyledTableRow>
            <TableCell colSpan={colSpan} align="center">
              {errorMessage ? <ErrorSpan>{errorMessage}</ErrorSpan> : message}
            </TableCell>
          </StyledTableRow>
        </MuiTableBody>
      );
    }

    return children;
  },
);

TableMessageProvider.propTypes = {
  isData: PropTypes.bool.isRequired,
  colSpan: PropTypes.number.isRequired,
  children: PropTypes.any.isRequired,
  noDataMessage: PropTypes.string,
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
};

TableMessageProvider.defaultProps = {
  errorMessage: '',
  noDataMessage: 'No data found',
  isLoading: false,
};
