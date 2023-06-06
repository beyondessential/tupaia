/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useParams, Outlet, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const MapSection = styled.div`
  background: #070d17;
  flex: 1;
`;

const Panel = styled.div`
  background: #272832;
  width: 300px;
  padding: 1rem;
  max-width: 100%;
`;

export const Project = () => {
  const location = useLocation();
  // Use these to fetch the project and any other entity info you might need
  const { projectCode, entityCode, '*': dashboardCode } = useParams();

  return (
    <Container>
      <MapSection />
      <Panel>
        <h1>Project: {projectCode}</h1>
        <h2>Entity: {entityCode}</h2>
        <h3>Dashboard: {dashboardCode}</h3>
        <Link to="/login" state={{ backgroundLocation: location }}>
          Login
        </Link>
      </Panel>
      <Outlet />
    </Container>
  );
};
