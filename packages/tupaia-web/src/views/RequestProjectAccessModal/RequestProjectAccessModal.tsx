/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import {
  generatePath,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { SpinningLoader } from '@tupaia/ui-components';
import { CountryAccessListItem } from '../../types';
import { DEFAULT_URL, MODAL_ROUTES, ROUTE_STRUCTURE, URL_SEARCH_PARAMS } from '../../constants';
import { LoadingScreen, Modal } from '../../components';
import { gaEvent, removeUrlSearchParams } from '../../utils';
import {
  useProjectCountryAccessList,
  useLandingPage,
  useProject,
  useUser,
} from '../../api/queries';
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

export const RequestProjectAccessModal = () => {
  const [urlSearchParams] = useSearchParams();
  const params = useParams();
  const [requestAdditionalCountries, setRequestAdditionalCountries] = useState(false);
  const { hash, ...location } = useLocation();
  const navigate = useNavigate();
  const { isLandingPage } = useLandingPage();
  const { isLoggedIn, isLoading: isLoadingUser, isFetching } = useUser();

  // Get the project code from the URL search params, or from the URL params if not otherwise set
  const altProjectCode = urlSearchParams.get(URL_SEARCH_PARAMS.PROJECT);
  const projectCode = altProjectCode || params?.projectCode;

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

  const { data: countries = [], isFetching: isLoadingCountryAccessList } =
    useProjectCountryAccessList(projectCode!);

  const countriesWithAccess = countries?.filter((c: CountryAccessListItem) => c.hasAccess);

  // the countries that have already got a request
  const requestedCountries = countries?.filter((c: CountryAccessListItem) => c.hasPendingAccess);

  // the countries that are available to request
  const availableCountries = countries?.filter(
    (c: CountryAccessListItem) => !c.hasAccess && !c.hasPendingAccess,
  );

  // Show the form if there are available countries, or if there are requested countries and the user has opted to request additional countries
  const showForm = requestedCountries?.length
    ? requestAdditionalCountries && availableCountries?.length > 0
    : availableCountries?.length > 0;

  // Show the requested countries if there are any, and the user has not opted to request additional countries
  const showRequestedCountries = requestedCountries?.length > 0 && !requestAdditionalCountries;

  const getOnCloseURI = () => {
    // if the user has accessed a forbidden entity directly, either direct them to the home entity if they have any access, or to the default URL + projects modal if they don't have project access
    if (!altProjectCode || altProjectCode === params?.projectCode) {
      if (project?.hasAccess)
        return {
          ...location,
          pathname: generatePath(ROUTE_STRUCTURE, {
            projectCode: project?.code,
            entityCode: project?.homeEntityCode,
            dashboardCode: project?.dashboardGroupName as string | undefined,
          }),
        };
      else
        return {
          ...location,
          pathname: DEFAULT_URL,
          hash: MODAL_ROUTES.PROJECTS,
        };
    }
    return location;
  };
  const onCloseModal = () => {
    gaEvent('User', 'Close Dialog');
    const onCloseUri = getOnCloseURI();
    navigate({
      ...onCloseUri,
      search: removeUrlSearchParams([URL_SEARCH_PARAMS.PROJECT]),
    });
  };
  return (
    <Modal isOpen onClose={onCloseModal}>
      <ModalBody>
        <LoadingScreen isLoading={isLoading} />
        <ModalHeader isLandingPage={isLandingPage} />
        <ProjectHero project={project} />
        <ProjectDetails project={project} />
        {isLoadingCountryAccessList ? (
          <SpinningLoader />
        ) : (
          <>
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
                onCloseModal={onCloseModal}
                closeButtonText={
                  projectCode === project?.code && project?.hasAccess
                    ? 'Close'
                    : 'Return to projects'
                }
              />
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  );
};
