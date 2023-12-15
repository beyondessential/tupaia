/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import { AccountSettingsSection } from '../AccountSettingsSection.tsx';
import { RequestCountryAccessForm } from './RequestCountryAccessForm.tsx';
import { useCurrentUser } from '../../../api';
import styled from 'styled-components';
import { Button } from '../../../components';
import { Box, Typography } from '@material-ui/core';
import { ProjectSelectModal } from '../../../layout/UserMenu/ProjectSelectModal.tsx';

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

const TitleWrapper = styled(Box)`
  align-items: baseline;
  display: block flex;
  flex-direction: row;
  gap: 0.5rem;
  margin-block-end: 0.6rem;
`;

export const RequestCountryAccessSection = () => {
  const {
    project: { name: projectName },
  } = useCurrentUser();

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const openProjectModal = () => setProjectModalOpen(true);
  const closeProjectModal = () => setProjectModalOpen(false);

  return (
    <AccountSettingsSection
      title={
        <TitleWrapper>
          <Typography variant="h1">Request country access</Typography>
          <ProjectButton onClick={openProjectModal} tooltip="Change project">
            {projectName}
          </ProjectButton>
        </TitleWrapper>
      }
      description="Select the countries you would like access to and the reason for requesting access"
    >
      <RequestCountryAccessForm />
      {projectModalOpen && <ProjectSelectModal onClose={closeProjectModal} />}
    </AccountSettingsSection>
  );
};
