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
  margin-block: 1.2rem;

  .MuiTableBody-root {
    display: flex;
    flex-direction: column;
    margin-block: 0.1875rem;
  }

  .MuiTableCell-root {
    border: none;
  }
`;

const StyledTableHeader = styled(TableHead)`
  border-block-end: 1px solid ${({ theme }) => theme.palette.divider};
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
      <Table size="small">
        <StyledTableHeader>
          <TableRow>
            <TableCell>Countries with access granted</TableCell>
          </TableRow>
        </StyledTableHeader>
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
