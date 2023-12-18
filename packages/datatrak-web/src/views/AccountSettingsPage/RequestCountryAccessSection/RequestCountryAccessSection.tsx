/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Box as MuiBox, Typography } from '@material-ui/core';
import { AccessGrantedCountryList } from './AccessGrantedCountryList.tsx';
import { AccountSettingsSection } from '../AccountSettingsSection.tsx';
import { Button } from '../../../components';
import { ProjectSelectModal } from '../../../layout/UserMenu/ProjectSelectModal.tsx';
import { RequestCountryAccessForm } from './RequestCountryAccessForm.tsx';
import { useCurrentUser } from '../../../api';

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

const Title = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
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
          <Title variant="h2">Request country access</Title>
          <ProjectButton onClick={openProjectModal} tooltip="Change project">
            {projectName}
          </ProjectButton>
        </TitleWrapper>
      }
      description="Select the countries you would like access to and the reason for requesting access"
      supportingInfo={<AccessGrantedCountryList />}
    >
      <RequestCountryAccessForm />
      {projectModalOpen && <ProjectSelectModal onClose={closeProjectModal} />}
    </AccountSettingsSection>
  );
};
