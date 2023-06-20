/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router';
import { MapLayout, Sidebar } from '../layout';
import { useProject, useUser } from '../api/queries';
import { useModal } from '../utils';
import { MODAL_ROUTES } from '../constants';
import { LoadingScreen } from '../components';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
`;

/**
 * This is the layout for the project/* view. This contains the map and the sidebar, as well as any overlays that are not auth overlays (i.e. not needed in landing pages)
 */
export const Project = () => {
  const { projectCode } = useParams();
  const { data: project, isLoading } = useProject(projectCode);
  const { isLoggedIn } = useUser();
  const { navigateToModal } = useModal();

  // check if the user is logged in. If they are not logged in and the project requires login, direct first to the login modal
  useEffect(() => {
    const checkLogin = () => {
      if (isLoggedIn || isLoading || (project && project.hasAccess)) return;
      navigateToModal(MODAL_ROUTES.LOGIN);
    };
    checkLogin();
  }, [project, isLoggedIn, isLoading]);
  return (
    <Container>
      <LoadingScreen isLoading={isLoading} />
      <MapLayout />
      <Sidebar />
      {/** This is where SessionExpiredDialog and any other overlays would go, as well as loading screen */}
    </Container>
  );
};
