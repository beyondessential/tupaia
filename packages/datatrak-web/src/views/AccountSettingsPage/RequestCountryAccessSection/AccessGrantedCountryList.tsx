/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import { useCountryAccessList } from '../../../api';

const StyledTableContainer = styled(TableContainer).attrs({
  elevation: 0,
  component: Paper,
})`
  border: 1px solid ${({ theme }) => theme.palette.divider};
  justify-self: flex-end;
  margin-block-start: 0.6rem;
  max-block-size: 12rem;

  .MuiTableBody-root {
    display: flex;
    flex-direction: column;
    padding-block: 0.1875rem;
  }

  .MuiTableCell-stickyHeader {
    background-color: ${({ theme }) => theme.palette.background.paper};
    // Shadow because border disappears when table body is scrolled
    box-shadow: 0 1px 0 0 ${({ theme }) => theme.palette.divider};
  }

  .MuiTableCell-root {
    border: none;
  }
`;

const EmptyStateLabel = styled(Typography).attrs({ color: 'textSecondary' })`
  font-size: inherit;
`;

export const AccessGrantedCountryList = () => {
  const { data: countries = [], isFetched, isLoading } = useCountryAccessList();
  const grantedCountries = countries.filter(country => country.hasAccess);
  const emptyStateText = isLoading || !isFetched ? 'Loading…' : 'None';

  return (
    <StyledTableContainer>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Countries with access granted</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {grantedCountries.length > 0 ? (
            grantedCountries.map(({ id, name }) => (
              <TableRow key={id}>
                <TableCell>{name}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell>
                <EmptyStateLabel>{emptyStateText}</EmptyStateLabel>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};