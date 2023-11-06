/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { MODAL_ROUTES, URL_SEARCH_PARAMS } from '../../constants';
import { LoadingScreen } from '../../components';
import { useCountryAccessList, useLandingPage, useProject, useUser } from '../../api/queries';
import { ModalHeader } from './ModalHeader';
import { ProjectHero } from './ProjectHero';
import { ProjectDetails } from './ProjectDetails';
import { ProjectAccessForm } from './ProjectAccessForm';
import { RequestedCountries } from './RequestedCountries';
import { CountryAccessListItem } from '../../types';

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.2rem 0 0;
  width: 30rem;
  max-width: 100%;
`;

export const RequestProjectAccessModal = () => {
  const [urlSearchParams] = useSearchParams();
  const [requestAdditionalCountries, setRequestAdditionalCountries] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLandingPage } = useLandingPage();
  const { isLoggedIn, isLoading: isLoadingUser, isFetching } = useUser();

  const projectCode = urlSearchParams.get(URL_SEARCH_PARAMS.PROJECT);

  const { data: project, isLoading } = useProject(projectCode!);

  useEffect(() => {
    // if user is not already logged in, redirect to login page first, and then redirect back to this page
    const checkLogin = () => {
      if (isLoadingUser || isLoggedIn || isFetching) return;
      navigate(
        {
          ...location,
          hash: MODAL_ROUTES.LOGIN,
        },
        {
          state: {
            referrer: location,
          },
        },
      );
    };
    checkLogin();
  }, [isLoggedIn, isLoadingUser, isFetching, project]);

  const { data: countries } = useCountryAccessList();
  // the countries that are applicable to this project
  const projectCountries = countries
    ?.filter((c: CountryAccessListItem) => project?.names?.includes(c.name))
    .filter((c: CountryAccessListItem) => !c.hasAccess);

  const getCountriesByAccess = (hasRequests: boolean) => {
    return projectCountries?.filter(({ accessRequests }) => {
      return hasRequests
        ? accessRequests.includes(projectCode!)
        : !accessRequests.includes(projectCode!);
    });
  };

  const countriesWithAccess = countries.filter((c: CountryAccessListItem) => c.hasAccess);

  // the countries that have already got a request
  const requestedCountries = getCountriesByAccess(true);

  // the countries that are available to request
  const availableCountries = getCountriesByAccess(false);

  // Show the form if there are available countries, or if there are requested countries and the user has opted to request additional countries
  const showForm = requestedCountries?.length
    ? requestAdditionalCountries && availableCountries?.length > 0
    : availableCountries?.length > 0;

  // Show the requested countries if there are any, and the user has not opted to request additional countries
  const showRequestedCountries = requestedCountries?.length > 0 && !requestAdditionalCountries;

  return (
    <ModalBody>
      <LoadingScreen isLoading={isLoading} />
      <ModalHeader isLandingPage={isLandingPage} />
      <ProjectHero project={project} />
      <ProjectDetails project={project} />
      {showRequestedCountries && (
        <RequestedCountries
          requestedCountries={requestedCountries}
          countriesWithAccess={countriesWithAccess}
          hasAdditionalCountries={availableCountries.length > 0}
          onShowForm={() => setRequestAdditionalCountries(true)}
          isLandingPage={isLandingPage}
        />
      )}
      {showForm && (
        <ProjectAccessForm
          availableCountries={availableCountries}
          projectName={project?.name}
          isLandingPage={isLandingPage}
        />
      )}
    </ModalBody>
  );
};
