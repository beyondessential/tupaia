/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';
import { useCurrentUser } from '../api';
import { ProjectSelectModal } from '../layout/UserMenu/ProjectSelectModal.tsx';
import { Button, TooltipButtonWrapper } from './Button.tsx';

/**
 * Ensures inline placement when appropriate. Necessary because tooltip attribute on the button
 * wraps it in an element whose outer `display` type is `block`.
 */
const Container = styled(Box)`
  .MuiTypography-h1 &,
  .MuiTypography-h2 &,
  .MuiTypography-h3 & {
    display: inline;

    > ${TooltipButtonWrapper} {
      display: inline;
    }

    :before {
      color: ${({ theme }) => theme.palette.text.secondary};
      content: '|';
      margin-inline: 0.25rem;
    }
  }
`;

const ProjectButton = styled(Button).attrs({
  disableFocusRipple: true,
  disableRipple: true,
  variant: 'text',
})`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;

  :focus,
  :focus-visible,
  :hover {
    background: none;
    color: ${({ theme }) => theme.palette.action.hover};
    text-decoration: underline;
  }

  .MuiButton-root,
  .MuiButton-label {
    font-size: inherit;
    font-weight: inherit;
    line-height: inherit;
    inline-size: fit-content;
    margin: 0;
    padding: 0;
  }
`;

export const ChangeProjectButton = () => {
  const { project } = useCurrentUser();
  const projectName = project?.name ?? null;

  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const openProjectModal = () => setProjectModalOpen(true);
  const closeProjectModal = () => setProjectModalOpen(false);

  return (
    <Container>
      <ProjectButton onClick={openProjectModal} tooltip="Change project">
        {projectName ?? 'Select project'}
      </ProjectButton>
      {projectModalOpen && <ProjectSelectModal onClose={closeProjectModal} />}
    </Container>
  );
};
