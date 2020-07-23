/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import styled from 'styled-components';
import MuiBox from '@material-ui/core/Box';
import { Link as RouterLink } from 'react-router-dom';
import MuiListItem from '@material-ui/core/ListItem';
import MuiListItemIcon from '@material-ui/core/ListItemIcon';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MuiListItemText from '@material-ui/core/ListItemText';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import * as COLORS from './story-utils/theme/colors';
import { RouterProvider } from '../helpers/RouterProvider';
import { ProfileButton, LightProfileButton } from '../src';

export default {
  title: 'ProfileButton',
  decorators: [story => <RouterProvider>{story()}</RouterProvider>],
};

const Container = styled(MuiBox)`
  max-width: 1200px;
  padding: 1rem;
`;

const StyledListItem = styled(MuiListItem)`
  padding-right: 3rem;
`;

const ListItemLink = props => <StyledListItem button component={RouterLink} {...props} />;

const ProfileLinks = () => (
  <React.Fragment>
    <ListItemLink to="/profile">
      <MuiListItemIcon>
        <AccountCircleIcon />
      </MuiListItemIcon>
      <MuiListItemText primary="Profile" />
    </ListItemLink>
    <ListItemLink to="/logout">
      <MuiListItemIcon>
        <ExitToAppIcon />
      </MuiListItemIcon>
      <MuiListItemText primary="Logout" />
    </ListItemLink>
  </React.Fragment>
);

export const profileButton = () => (
  <Container>
    <ProfileButton startIcon={<Avatar>K</Avatar>} listItems={<ProfileLinks />}>
      Kupe
    </ProfileButton>
  </Container>
);

export const lightProfileButton = () => (
  <Container bgcolor={COLORS.BLUE}>
    <LightProfileButton startIcon={<Avatar>K</Avatar>} listItems={<ProfileLinks />}>
      Kupe
    </LightProfileButton>
  </Container>
);
