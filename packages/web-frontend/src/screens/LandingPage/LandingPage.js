/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { useAuth } from './useAuth';
import OverlayDiv from '../../containers/OverlayDiv';
import { useProjects } from './useProjects';
import { renderProjectsWithFilter } from '../../containers/OverlayDiv/components/ProjectPage';

const Wrapper = styled.div`
  position: relative;
  background-size: cover;
  background-position: center;
`;

const Container = styled(MuiContainer)`
  position: relative;
  min-height: calc(100vh - 75px);
  background-color: #bfbfbf;
  padding-left: 50px;
  padding-right: 50px;
  padding-top: 5%;
`;

const Projects = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 50px;
  margin: 0 auto;
  max-width: 1200px;
  padding-top: 10%;
`;

const Title = styled(Typography)`
  font-style: normal;
  font-weight: 600;
  font-size: 2rem;
  line-height: 3rem;
  margin-bottom: 1.8rem;
  color: white;
  text-shadow: 1px 1px #333;
  max-width: 480px;

  ${props => props.theme.breakpoints.down('sm')} {
    line-height: 1.4;
  }
`;

const NavBar = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #0f3150;
  color: white;
  height: 75px;
  padding: 0 30px;

  button {
    margin-right: 15px;
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  left: 50px;
  right: 50px;
  border-top: 1px solid white;
  height: 75px;
`;

export const LandingPage = () => {
  console.log('landing...');
  const { projects, navigateToProject, navigateToRequestProjectAccess } = useProjects();

  const { isUserLoggedIn, currentUserUsername, navigateToLogin, navigateToLogout } = useAuth();

  const projectsWithAccess = renderProjectsWithFilter(
    projects,
    true,
    navigateToProject,
    'View project',
  );

  const projectsPendingAccess = renderProjectsWithFilter(
    projects,
    'pending',
    navigateToRequestProjectAccess,
    'Approval in progress',
  );

  const noAccessAction = isUserLoggedIn ? navigateToRequestProjectAccess : navigateToLogin;
  const noAccessText = isUserLoggedIn ? 'Request access' : 'Log in';
  const projectsWithoutAccess = renderProjectsWithFilter(
    projects,
    false,
    noAccessAction,
    noAccessText,
  );

  return (
    <>
      <NavBar>
        {currentUserUsername && (
          <Box mr={3}>
            {currentUserUsername}
            <span style={{ marginLeft: 30 }}>|</span>
          </Box>
        )}
        {isUserLoggedIn ? (
          <Button onClick={navigateToLogout}>Logout</Button>
        ) : (
          <div>
            <Button>Register</Button>
            <Button onClick={navigateToLogin}>Login</Button>
          </div>
        )}
      </NavBar>
      <Wrapper>
        <Container maxWidth={false}>
          <Title variant="h1">Select a project below to view.</Title>
          <Projects>
            {projectsWithAccess}
            {projectsPendingAccess}
            {projectsWithoutAccess}
          </Projects>
          <Footer />
        </Container>
      </Wrapper>
      <OverlayDiv />
    </>
  );
};
