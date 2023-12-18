/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Box as MuiBox,
  Paper,
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableContainer as MuiTableContainer,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
  Typography,
} from '@material-ui/core';
import { AccountSettingsSection } from '../AccountSettingsSection.tsx';
import { Button } from '../../../components';
import { ProjectSelectModal } from '../../../layout/UserMenu/ProjectSelectModal.tsx';
import { RequestCountryAccessForm } from './RequestCountryAccessForm.tsx';
import { useCountryAccessList, useCurrentUser } from '../../../api';
import { Country, Project } from '@tupaia/types';

interface CountryAccess {
  id: Country['id'];
  name: Country['name'];
  hasAccess: boolean;
  accessRequests: Project['code'][];
}

const ProjectButton = styled(Button).attrs({
  variant: 'text',
})`
  margin: 0;
  padding-block: 0;
  color: ${({ theme }) => theme.palette.text.secondary};
  padding-inline: 1rem;

  &:hover {
    background: none;
    color: ${({ theme }) => theme.palette.action.hover};
    text-decoration: underline;
  }
`;

const TitleWrapper = styled(MuiBox)`
  align-items: baseline;
  display: block flex;
  flex-direction: row;
  gap: 0.5rem;
  margin-block-end: 0.6rem;
`;

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

export const RequestCountryAccessSection = () => {
  const {
    project: { name: projectName },
  } = useCurrentUser();
  const { data: countries } = useCountryAccessList();

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const openProjectModal = () => setProjectModalOpen(true);
  const closeProjectModal = () => setProjectModalOpen(false);

  const grantedCountries: CountryAccess[] = countries.filter(
    (country: CountryAccess) => country.hasAccess,
  );

  return (
    <AccountSettingsSection
      title={
        <TitleWrapper>
          <Typography variant="h2">Request country access</Typography>
          <ProjectButton onClick={openProjectModal} tooltip="Change project">
            {projectName}
          </ProjectButton>
        </TitleWrapper>
      }
      description="Select the countries you would like access to and the reason for requesting access"
      supplement={
        <>
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
                  <MuiTableCell>
                    <MuiTableRow>
                      <EmptyStateLabel>None</EmptyStateLabel>
                    </MuiTableRow>
                  </MuiTableCell>
                )}
              </MuiTableBody>
            </MuiTable>
          </StyledTableContainer>
        </>
      }
    >
      <RequestCountryAccessForm />
      {projectModalOpen && <ProjectSelectModal onClose={closeProjectModal} />}
    </AccountSettingsSection>
  );
};
