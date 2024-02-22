/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
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
import { ResBody as CountryAccessList } from '@tupaia/types/src/types/requests/tupaia-web-server/CountryAccessListRequest';
import { UseQueryResult } from 'react-query';
import { ProjectResponse } from '@tupaia/types';

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
    // Fix table header appearing over modeals
    z-index: auto;
  }

  .MuiTableCell-root {
    border: none;
  }
`;

const EmptyStateLabel = styled(Typography).attrs({ color: 'textSecondary' })`
  font-size: inherit;
`;

interface AccessGrantedCountryListProps {
  countryAccessList: UseQueryResult<CountryAccessList>;
  project: ProjectResponse;
}

export const AccessGrantedCountryList = ({
  countryAccessList,
  project,
}: AccessGrantedCountryListProps) => {
  const { data: countries = [], isFetched, isLoading } = countryAccessList;

  // “Applicable” here refers to countries that a project concerns
  const grantedApplicableCountries = countries.filter(
    country => country.hasAccess && project.names?.includes(country.name),
  );

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
          {grantedApplicableCountries.length > 0 ? (
            grantedApplicableCountries.map(({ id, name }) => (
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
