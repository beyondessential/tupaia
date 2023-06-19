/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { PROJECT_PARAM } from '../../constants';
import { LoadingScreen } from '../../components';
import { useCountryAccessList, useProject } from '../../api/queries';
import { ModalHeader } from './ModalHeader';
import { ProjectHero } from './ProjectHero';
import { ProjectDetails } from './ProjectDetails';
import { ProjectAccessForm } from './ProjectAccessForm';
import { RequestedCountries } from './RequestedCountries';

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.2rem 0 0;
  width: 30rem;
  max-width: 100%;
`;

export const RequestProjectAccess = () => {
  const [urlParams] = useSearchParams();
  const [requestAdditionalCountries, setRequestAdditionalCountries] = useState(false);

  const projectCode = urlParams.get(PROJECT_PARAM);

  const { data: project, isLoading } = useProject(projectCode!);

  const { data: countries } = useCountryAccessList();
  // the countries that are applicable to this project
  const projectCountries = countries.filter(c => project?.names?.includes(c.name));

  const getCountriesByAccess = (hasRequests: boolean) => {
    return projectCountries?.filter(({ hasAccess, accessRequests }) => {
      return (
        !hasAccess &&
        (hasRequests
          ? accessRequests.includes(projectCode!)
          : !accessRequests.includes(projectCode!))
      );
    });
  };

  // the countries that have already got a request
  const requestedCountries = getCountriesByAccess(true);

  // the countries that are available to request
  const availableCountries = getCountriesByAccess(false);

  // Show the form if there are available countries, or if there are requested countries and the user has opted to request additional countries
  const showForm = requestedCountries.length
    ? requestAdditionalCountries && availableCountries.length > 0
    : availableCountries.length > 0;

  // Show the requested countries if there are any, and the user has not opted to request additional countries
  const showRequestedCountries = requestedCountries.length > 0 && !requestAdditionalCountries;

  return (
    <ModalBody>
      <LoadingScreen isLoading={isLoading} />
      <ModalHeader />
      <ProjectHero project={project} />
      <ProjectDetails project={project} />
      {showRequestedCountries && (
        <RequestedCountries
          requestedCountries={requestedCountries}
          hasAdditionalCountries={availableCountries.length > 0}
          onShowForm={() => setRequestAdditionalCountries(true)}
        />
      )}
      {showForm && (
        <ProjectAccessForm availableCountries={availableCountries} projectName={project?.name} />
      )}
    </ModalBody>
  );
};
