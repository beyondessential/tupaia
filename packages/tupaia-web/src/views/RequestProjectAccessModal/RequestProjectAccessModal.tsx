/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect, useState } from 'react';
import {
  Location,
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
  const requestingProjectCode = altProjectCode || params?.projectCode;

  const { data: requestingProject, isLoading } = useProject(requestingProjectCode!);
  // the project loaded behind the modal, based on the url project code
  const { data: backgroundProject } = useProject(params?.projectCode);

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
  }, [isLoggedIn, isLoadingUser, isFetching, requestingProject]);

  const { data: countries = [], isFetching: isLoadingCountryAccessList } =
    useProjectCountryAccessList(requestingProjectCode!);

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

  // if the project code is the same as the selected project and the user has access, then we are not returning to the projects page, we just want to close the modal
  const isReturningToProjects = !(
    (!altProjectCode || altProjectCode === params?.projectCode) &&
    requestingProject?.hasAccess
  );

  const getBaseCloseLocation = () => {
    if (isLandingPage) return location;
    // if the user has accessed the request access modal and does have access to that project in some way, then return to the project. This would happen if the user went directly to the project with the request access modal details in the url
    if (
      (!altProjectCode || altProjectCode === params?.projectCode) &&
      requestingProject?.hasAccess
    ) {
      return {
        ...location,
        pathname: generatePath(ROUTE_STRUCTURE, {
          projectCode: requestingProject?.code,
          entityCode: requestingProject?.homeEntityCode,
          dashboardName: requestingProject?.dashboardGroupName as string | undefined,
        }),
      };
    }
    return {
      ...location,
      // if the user has access to the project in the background, then return to the project with the project modal open, otherwise return to the default url with the project modal open
      pathname: backgroundProject?.hasAccess ? location.pathname : DEFAULT_URL,
      hash: MODAL_ROUTES.PROJECTS,
    };
  };

  const getCloseLocation = () => {
    const baseCloseLocation = getBaseCloseLocation();
    // return the base close location with the project search param removed
    return {
      ...baseCloseLocation,
      search: removeUrlSearchParams([URL_SEARCH_PARAMS.PROJECT]),
    } as Location;
  };

  const closeLocation = getCloseLocation();

  const onCloseModal = () => {
    gaEvent('User', 'Close Dialog');
    navigate(closeLocation);
  };
  return (
    <Modal isOpen onClose={onCloseModal}>
      <ModalBody>
        <LoadingScreen isLoading={isLoading} />
        <ModalHeader isLandingPage={isLandingPage} baseCloseLocation={closeLocation} />
        <ProjectHero project={requestingProject} />
        <ProjectDetails project={requestingProject} />
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
                baseCloseLocation={closeLocation}
              />
            )}
            {showForm && (
              <ProjectAccessForm
                availableCountries={availableCountries}
                projectName={requestingProject?.name}
                isLandingPage={isLandingPage}
                onCloseModal={onCloseModal}
                closeButtonText={isReturningToProjects ? 'Return to projects' : 'Close'}
              />
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  );
};
