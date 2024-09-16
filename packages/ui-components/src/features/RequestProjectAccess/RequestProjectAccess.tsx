/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { ProjectCountryAccessListRequest, WebServerProjectRequest } from '@tupaia/types';
import { ProjectAccessForm } from './ProjectAccessForm';
import { Alert, SpinningLoader } from '../../components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
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
  max-width: 8rem;
  width: 100%;
  height: auto;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.palette.common.white};
  padding: 0.8rem;
`;

const ProjectDetails = styled.div`
  padding: 1rem 0 1.6rem;
`;

const Title = styled(Typography).attrs({
  variant: 'h1',
})`
  font-size: 1.125rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const ProjectName = styled(Typography).attrs({
  variant: 'h2',
})`
  font-size: 1rem;
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
`;

const ProjectDescription = styled(Typography)`
  font-size: 0.875rem;
  margin-block-start: 0.25rem;
`;

type CountryAccessListItem = ProjectCountryAccessListRequest.ResBody[number];

interface RequestProjectAccessProps {
  onClose?: () => void;
  project?: WebServerProjectRequest.ResBody;
  isLoading?: boolean;
  isFetched?: boolean;
  countries: CountryAccessListItem[];
  onSubmit: (data: { entityIds: string[]; message: string; projectCode: string }) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  closeButtonText?: string;
  errorMessage?: string;
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
  closeButtonText,
  errorMessage,
}: RequestProjectAccessProps) => {
  const showLoading = isLoading || !isFetched;

  // the countries that are available to request
  const availableCountries = countries?.filter(
    (c: CountryAccessListItem) => !c.hasAccess && !c.hasPendingAccess,
  );

  // show the no countries message if the country access list has loaded and there are no countries available
  const showNoCountriesMessage = !isLoading && !availableCountries?.length;

  return (
    <Wrapper>
      <Title>Request project access</Title>
      <BodyText>Complete the form below to request access to this project</BodyText>
      <Container>
        {showLoading ? (
          <SpinningLoader />
        ) : (
          <>
            {project?.logoUrl && <Logo src={project.logoUrl} alt={project.name} />}
            <ProjectDetails>
              <ProjectName>{project?.name}</ProjectName>
              {project?.description && (
                <ProjectDescription>{project.description}</ProjectDescription>
              )}
            </ProjectDetails>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {showNoCountriesMessage ? (
              <Alert severity="info">
                There are no countries available to request access to for this project. This means
                you already have access to all countries in this project. If you need to change your
                permissions, please contact your system administrator.
              </Alert>
            ) : (
              <ProjectAccessForm
                project={project}
                onClose={onClose}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                isSuccess={isSuccess}
                countries={countries}
                closeButtonText={closeButtonText}
              />
            )}
          </>
        )}
      </Container>
    </Wrapper>
  );
};
