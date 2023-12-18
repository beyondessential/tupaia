import {
  Paper,
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableContainer as MuiTableContainer,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
  Typography,
} from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import { Country, Project } from '@tupaia/types';
import { useCountryAccessList } from '../../../api';

interface CountryAccess {
  id: Country['id'];
  name: Country['name'];
  hasAccess: boolean;
  accessRequests: Project['code'][];
}

const StyledTableContainer = styled(MuiTableContainer).attrs({
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

const StyledTableHeader = styled(MuiTableHead)`
  border-block-end: 1px solid ${({ theme }) => theme.palette.grey[400]};
`;

const EmptyStateLabel = styled(Typography).attrs({ color: 'textSecondary' })`
  font-size: inherit;
`;

export const AccessGrantedCountryList = () => {
  const { data: countries } = useCountryAccessList();
  const grantedCountries: CountryAccess[] = countries.filter(
    (country: CountryAccess) => country.hasAccess,
  );

  return (
    <StyledTableContainer>
      <MuiTable size="small">
        <StyledTableHeader>
          <MuiTableRow>
            <MuiTableCell>Countries with access granted</MuiTableCell>
          </MuiTableRow>
        </StyledTableHeader>
        <MuiTableBody>
          {grantedCountries.length > 0 ? (
            grantedCountries.map(country => (
              <MuiTableRow key={country.id}>
                <MuiTableCell>{country.name}</MuiTableCell>
              </MuiTableRow>
            ))
          ) : (
            <MuiTableRow>
              <MuiTableCell>
                <EmptyStateLabel>None</EmptyStateLabel>
              </MuiTableCell>
            </MuiTableRow>
          )}
        </MuiTableBody>
      </MuiTable>
    </StyledTableContainer>
  );
};
