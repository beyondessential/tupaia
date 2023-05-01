/*
 * This is just a place holder Landing Page template. The actual landing page template will be
 * developed in another ticket. @see waitp-1189
 */

import React from 'react';
import styled from 'styled-components';
import MuiContainer from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import OverlayDiv from '../../containers/OverlayDiv';
import { useAuth } from './useAuth';
import { useNavigation } from './useNavigation';
import { ProjectCardList } from '../../containers/OverlayDiv/components/ProjectPage/ProjectCardList';
import { useCustomLandingPages } from './useCustomLandingPages';

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
  const {
    navigateToProject,
    navigateToRequestProjectAccess,
    navigateToLogin,
    navigateToLogout,
  } = useNavigation();
  const { projects } = useCustomLandingPages();
  const { isUserLoggedIn, currentUserUsername } = useAuth();

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
            <Button onClick={navigateToLogin}>Register</Button>
            <Button onClick={navigateToLogin}>Login</Button>
          </div>
        )}
      </NavBar>
      <Wrapper>
        <Container maxWidth={false}>
          <Title variant="h1">Select a project below to view.</Title>
          <Projects>
            <ProjectCardList
              projects={projects}
              accessType
              action={navigateToProject}
              actionText="View project"
            />
            <ProjectCardList
              projects={projects}
              accessType="pending"
              action={navigateToRequestProjectAccess}
              actionText="Approval in progress"
            />
            <ProjectCardList
              projects={projects}
              accessType={false}
              action={isUserLoggedIn ? navigateToRequestProjectAccess : navigateToLogin}
              actionText={isUserLoggedIn ? 'Request access' : 'Log in'}
            />
          </Projects>
          <Footer />
        </Container>
      </Wrapper>
      {/* Include the OverlayDiv so that the loging and logout functionality is available on the */}
      {/* custom landing pages */}
      <OverlayDiv />
    </>
  );
};
