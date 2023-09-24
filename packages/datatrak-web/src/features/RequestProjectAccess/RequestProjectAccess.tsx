/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { useProject } from '../../api/queries';
import { ProjectAccessForm } from './ProjectAccessForm';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const BodyText = styled(Typography).attrs({
  color: 'textSecondary',
})`
  margin: 1rem 0 2rem 0;
  font-size: 0.875rem;
`;

const Container = styled.div`
  padding-top: 1.75rem;
`;

const Logo = styled.img`
  max-width: 7.5rem;
  width: 100%;
  height: auto;
`;

const ProjectDetails = styled.div`
  padding: 1rem 0 1.6rem 0;
`;

interface RequestProjectAccessProps {
  variant?: 'page' | 'modal';
  projectCode?: string;
  onClose?: () => void;
}

export const RequestProjectAccess = ({ projectCode, onClose }: RequestProjectAccessProps) => {
  const { data: project, isLoading: isLoadingProject, isFetched } = useProject(projectCode);

  const showLoading = isLoadingProject || !isFetched;

  return (
    <Wrapper>
      <Typography variant="h1">Request Project Access</Typography>
      <BodyText>Complete the form below to request access to this project</BodyText>
      <Container>
        {showLoading ? (
          <SpinningLoader />
        ) : (
          <>
            {project?.logoUrl && <Logo src={project?.logoUrl!} alt={project?.name} />}
            <ProjectDetails>
              <Typography variant="h2">{project?.name}</Typography>
              {project?.description && <Typography>{project?.description}</Typography>}
            </ProjectDetails>
            <ProjectAccessForm project={project} onClose={onClose} />
          </>
        )}
      </Container>
    </Wrapper>
  );
};
