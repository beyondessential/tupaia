/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { AccessGrantedCountryList } from './AccessGrantedCountryList.tsx';
import { AccountSettingsSection } from '../AccountSettingsSection.tsx';
import { Button } from '../../../components';
import { ProjectSelectModal } from '../../../layout/UserMenu/ProjectSelectModal.tsx';
import { RequestCountryAccessForm } from './RequestCountryAccessForm.tsx';
import { useCurrentUser } from '../../../api';

/**
 * Ensures placement of project button inline with section heading. Necessary because tooltip attribute on the button
 * wraps it in an element whose outer `display` type is `block`.
 */
const ProjectButtonWrapper = styled(Box)`
  display: inline-block;
`;

const ProjectButton = styled(Button).attrs({
  disableFocusRipple: true,
  disableRipple: true,
  variant: 'text',
})`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: inherit;
  margin: 0;
  padding: 0;

  :before {
    color: ${({ theme }) => theme.palette.text.secondary};
    content: '|';
    margin-inline: 0.25rem;
  }

  :focus,
  :focus-visible,
  :hover {
    background: none;
    color: ${({ theme }) => theme.palette.action.hover};
    text-decoration: underline;
  }

  .MuiButton-label {
    font-size: inherit;
    inline-size: fit-content;
    margin: 0;
    padding: 0;
  }
`;

export const RequestCountryAccessSection = () => {
  const { project } = useCurrentUser();
  const projectName = project?.name ?? null;

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const openProjectModal = () => setProjectModalOpen(true);
  const closeProjectModal = () => setProjectModalOpen(false);

  const description = (
    <>
      <p>Select the countries you would like access to and the reason for requesting access</p>
      <AccessGrantedCountryList />
    </>
  );

  return (
    <AccountSettingsSection
      title={
        <>
          Request country access
          <ProjectButtonWrapper>
            <ProjectButton onClick={openProjectModal} tooltip="Change project">
              {projectName ?? 'Change project'}
            </ProjectButton>
          </ProjectButtonWrapper>
        </>
      }
      description={description}
    >
      <RequestCountryAccessForm />
      {projectModalOpen && <ProjectSelectModal onClose={closeProjectModal} />}
    </AccountSettingsSection>
  );
};
