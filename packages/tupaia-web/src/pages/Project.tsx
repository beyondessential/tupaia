/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { MapLayout, Sidebar } from '../layout';
import { useUser } from '../api/queries';
import { useModal } from '../utils';
import { MODAL_ROUTES } from '../constants';

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
  const { navigateToModal } = useModal();
  const { isLoggedIn, isLoading } = useUser();

  // on first load, if user is not logged in, show the login modal
  useEffect(() => {
    const checkLoginStatus = () => {
      if (isLoading || isLoggedIn) return;
      navigateToModal(MODAL_ROUTES.LOGIN);
    };
    checkLoginStatus();
  }, [isLoading]);
  return (
    <Container>
      <MapLayout />
      <Sidebar />
      {/** This is where SessionExpiredDialog and any other overlays would go, as well as loading screen */}
    </Container>
  );
};
