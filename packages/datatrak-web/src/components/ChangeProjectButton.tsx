import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';

import { useCurrentUserContext } from '../api';
import { ProjectSelectModal } from '../layout/UserMenu/ProjectSelectModal';
import { Button, TooltipButtonWrapper } from './Button';
import { useDatabaseContext } from '../hooks/database';
import { ensure } from '@tupaia/tsutils';
import { useIsOfflineFirst } from '../api/offlineFirst';

/**
 * Semantically useless wrapper, but prevents {@link TooltipButtonWrapper} from wreaking havoc on
 * the button’s layout.
 */
const Container = styled.div<{ $leadingBorder?: boolean }>`
  ${props =>
    props.$leadingBorder &&
    css`
      border-inline-start: max(0.0625rem, 1px) solid ${props => props.theme.palette.text.secondary};
      padding-inline-start: 0.5rem;
    `}

  &,
  ${TooltipButtonWrapper} {
    display: inline;
  }
`;

const ProjectButton = styled(Button).attrs({
  disableFocusRipple: true,
  disableRipple: true,
  variant: 'text',
})`
  color: ${({ theme }) => theme.palette.text.secondary};

  :focus,
  :focus-visible,
  :hover {
    background: none;
    color: ${({ theme }) => theme.palette.action.hover};
    text-decoration: underline;
  }

  &,
  .MuiButton-root,
  .MuiButton-label {
    font-size: inherit;
    font-weight: inherit;
    inline-size: fit-content;
    line-height: inherit;
    margin: 0;
    padding: 0;
  }

  .MuiButton-label {
    display: contents;
  }
`;

interface ChangeProjectButtonProps extends React.ComponentPropsWithoutRef<typeof Container> {
  leadingBorder?: boolean;
}

export const ChangeProjectButton = ({ leadingBorder, ...props }: ChangeProjectButtonProps) => {
  const { project } = useCurrentUserContext();
  const { models } = useDatabaseContext() || {};
  const isOfflineFirst = useIsOfflineFirst();

  const [projectModalIsOpen, setProjectModalIsOpen] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const openProjectModal = () => setProjectModalIsOpen(true);
  const closeProjectModal = () => setProjectModalIsOpen(false);

  useEffect(() => {
    const checkSynced = async () => {
      if (isOfflineFirst) {
        const projectCount = await ensure(models).project.count({});
        if (projectCount) {
          setHasSynced(true);
        }
      }
    };
    checkSynced();
  }, [isOfflineFirst, models]);

  const getProjectName = useCallback(() => {
    if (project?.name) {
      return project?.name;
    }
    const noSyncedProject = isOfflineFirst && !hasSynced;
    return noSyncedProject ? 'Syncing projects...' : 'Select project';
  }, [project?.name, isOfflineFirst, hasSynced]);

  return (
    <Container $leadingBorder={leadingBorder} {...props}>
      <ProjectButton onClick={openProjectModal} tooltip="Change project">
        {getProjectName()}
      </ProjectButton>
      {projectModalIsOpen && <ProjectSelectModal onBack={closeProjectModal} />}
    </Container>
  );
};
