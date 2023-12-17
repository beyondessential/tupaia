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
import { CountryAccessListRequest } from '@tupaia/types';

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
});

export const RequestCountryAccessSection = () => {
  const {
    project: { name: projectName },
  } = useCurrentUser();
  const { data: countries } = useCountryAccessList();

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const openProjectModal = () => setProjectModalOpen(true);
  const closeProjectModal = () => setProjectModalOpen(false);

  const grantedCountries = countries.filter(
    (country: CountryAccessListRequest.ResBody) => country.hasAccess,
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
          <MuiTableContainer>
            <MuiTable size="small">
              <MuiTableHead>
                <MuiTableRow>
                  <MuiTableCell>Countries with access granted</MuiTableCell>
                </MuiTableRow>
              </MuiTableHead>
              <MuiTableBody>
                {grantedCountries.map(country => (
                  <MuiTableCell>{country.name}</MuiTableCell>
                ))}
              </MuiTableBody>
            </MuiTable>
          </MuiTableContainer>
        </>
      }
    >
      <RequestCountryAccessForm />
      {projectModalOpen && <ProjectSelectModal onClose={closeProjectModal} />}
    </AccountSettingsSection>
  );
};
