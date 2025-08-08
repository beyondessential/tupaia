import React, { useEffect } from 'react';
import {
  Location,
  generatePath,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import styled from 'styled-components';
import { RequestProjectAccess } from '@tupaia/ui-components';
import { DEFAULT_URL, MODAL_ROUTES, ROUTE_STRUCTURE, URL_SEARCH_PARAMS } from '../constants';
import { Modal } from '../components';
import { gaEvent, removeUrlSearchParams, useModal } from '../utils';
import {
  useProjectCountryAccessList,
  useLandingPage,
  useProject,
  useUser,
  useEntity,
} from '../api/queries';
import { useRequestCountryAccess } from '../api/mutations';

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.2rem;
  width: 48rem;
  max-width: 100%;

  .MuiAlert-root + .MuiAlert-root {
    margin-block-start: 1rem;
  }
`;

export const RequestProjectAccessModal = () => {
  const [urlSearchParams] = useSearchParams();
  const params = useParams();
  const { closeModal } = useModal();

  const {
    mutate: requestCountryAccess,
    isLoading: isSubmitting,
    isError: hasRequestCountryAccessError,
    error: requestCountryAccessError,
    isSuccess,
  } = useRequestCountryAccess();

  const { hash, state, ...location } = useLocation() as Location & {
    state: { referrer?: Location };
  };
  const navigate = useNavigate();
  const { isLandingPage } = useLandingPage();
  const { isLoggedIn, isLoading: isLoadingUser, isFetching } = useUser();

  // Get the project code from the URL search params, or from the URL params if not otherwise set
  const altProjectCode = urlSearchParams.get(URL_SEARCH_PARAMS.PROJECT);
  const requestingProjectCode = altProjectCode || params?.projectCode;

  const { data: requestingProject, isLoading, isFetched } = useProject(requestingProjectCode!);
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

  // if the project code is the same as the selected project and the user has access, then we are not returning to the projects page, we just want to close the modal
  const isReturningToProjects = !(
    (!altProjectCode || altProjectCode === params?.projectCode) &&
    requestingProject?.hasAccess
  );

  // only request the entity if the project code is the same as the selected project, or if the alt project code is not set, so that we don't get any false errors. This query is just to check if the user has been directed here from the useEntity hook because of a 403 error
  const showCheckForEntityError = !altProjectCode || params.projectCode === altProjectCode;
  const { error: entityError, isError } = useEntity(
    params.projectCode,
    params.entityCode,
    showCheckForEntityError,
  );

  const error = requestCountryAccessError || entityError;

  // show the error if the user is getting a 403 error when trying to access an entity, as this means they have been redirected here from the useEntity hook
  const showError = (isError && entityError.code === 403) || hasRequestCountryAccessError;

  const getBaseBackLocation = () => {
    if (isLandingPage) return location;

    if (isReturningToProjects) {
      const newHash = state?.referrer?.hash ? state?.referrer.hash : MODAL_ROUTES.PROJECTS;
      return {
        ...location,
        // if the user has access to the project in the background, then return to the project with the project modal open, otherwise return to the default url with the project modal open
        pathname: backgroundProject?.hasAccess ? location.pathname : DEFAULT_URL,
        hash: newHash,
      };
    }

    // if the user has accessed the request access modal and does have access to that project in some way, then return to the project. This would happen if the user went directly to the project with the request access modal details in the url
    return {
      ...location,
      pathname: generatePath(ROUTE_STRUCTURE, {
        projectCode: requestingProject?.code,
        entityCode: requestingProject?.homeEntityCode,
        dashboardName: requestingProject?.dashboardGroupName as string | undefined,
      }),
    };
  };

  const getBackLocation = () => {
    const baseBackLocation = getBaseBackLocation();
    // return the base close location with the project search param removed
    return {
      ...baseBackLocation,
      search: removeUrlSearchParams([URL_SEARCH_PARAMS.PROJECT]),
    } as Location;
  };

  const backLocation = getBackLocation();

  const onCloseModal = () => {
    gaEvent('User', 'Close Dialog');
    closeModal();
  };

  const onBack = () => {
    navigate(backLocation);
  };

  return (
    <Modal isOpen onClose={onCloseModal}>
      <ModalBody>
        <RequestProjectAccess
          project={requestingProject}
          countries={countries}
          isLoading={isLoading || isLoadingCountryAccessList || !isFetched}
          isSubmitting={isSubmitting}
          onSubmit={requestCountryAccess}
          isSuccess={isSuccess}
          onBack={onBack}
          backButtonText={isReturningToProjects ? 'Back to projects' : 'Close'}
          errorMessage={showError ? error.message : undefined}
        />
      </ModalBody>
    </Modal>
  );
};
