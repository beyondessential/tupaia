/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { SpinningLoader } from '@tupaia/ui-components';
import { WebServerProjectRequest } from '@tupaia/types';
import { ProjectAccessForm } from './ProjectAccessForm';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const BodyText = styled(Typography).attrs({
  color: 'textSecondary',
})`
  font-size: 0.875rem;
  margin: 1rem 0 2rem;
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
  padding: 1rem 0 1.6rem;
`;

type Country = {
  id: string;
  name: string;
  hasPendingAccess: boolean;
};

interface RequestProjectAccessProps {
  onClose?: () => void;
  project?: WebServerProjectRequest.ResBody;
  isLoading?: boolean;
  isFetched?: boolean;
  countries: Country[];
  onSubmit: (data: { entityIds: string[]; message: string; projectCode: string }) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
}

export const RequestProjectAccess = ({
  onClose,
  project,
  isLoading,
  isFetched,
  countries,
  onSubmit,
  isSuccess,
  isSubmitting,
}: RequestProjectAccessProps) => {
  const showLoading = isLoading || !isFetched;

  return (
    <Wrapper>
      <Typography variant="h1">Request project access</Typography>
      <BodyText>Complete the form below to request access to this project</BodyText>
      <Container>
        {showLoading ? (
          <SpinningLoader />
        ) : (
          <>
            {project?.logoUrl && <Logo src={project.logoUrl} alt={project.name} />}
            <ProjectDetails>
              <Typography variant="h2">{project?.name}</Typography>
              {project?.description && <Typography>{project.description}</Typography>}
            </ProjectDetails>
            <ProjectAccessForm
              project={project}
              onClose={onClose}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              isSuccess={isSuccess}
              countries={countries}
            />
          </>
        )}
      </Container>
    </Wrapper>
  );
};
