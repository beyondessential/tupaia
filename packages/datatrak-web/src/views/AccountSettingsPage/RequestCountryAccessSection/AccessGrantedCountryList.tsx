/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Paper, TableCell, TableContainer, TableHead, Typography } from '@material-ui/core';
import { TupaiaWebCountryAccessListRequest } from '@tupaia/types';
import { useCountryAccessList } from '../../../api';

const StyledTableContainer = styled(TableContainer).attrs({
  elevation: 0,
  component: Paper,
})`
  border: 1px solid ${({ theme }) => theme.palette.grey[400]};
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
  border-block-end: 1px solid ${({ theme }) => theme.palette.grey[400]};
`;

const EmptyStateLabel = styled(Typography).attrs({ color: 'textSecondary' })`
  font-size: inherit;
`;

export const AccessGrantedCountryList = () => {
  const queryResult = useCountryAccessList();
  const countries: TupaiaWebCountryAccessListRequest.ResBody = queryResult.data ?? [];
  const grantedCountries = countries.filter(
    (country: TupaiaWebCountryAccessListRequest.CountryAccess) => country.hasAccess,
  );

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
            grantedCountries.map((country: TupaiaWebCountryAccessListRequest.CountryAccess) => (
              <TableRow key={country.id}>
                <TableCell>{country.name}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell>
                <EmptyStateLabel>Loading…</EmptyStateLabel>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </StyledTableContainer>
  );
};
