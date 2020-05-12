/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import styled from 'styled-components';
import MuiListItem from '@material-ui/core/ListItem';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import MuiListItemIcon from '@material-ui/core/ListItemIcon';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MuiListItemText from '@material-ui/core/ListItemText';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Avatar from '@material-ui/core/Avatar';
import { LightProfileButton } from '@tupaia/ui-components';
import { FakeStore } from '../FakeStore';

const StyledListItem = styled(MuiListItem)`
  padding-right: 3rem;
`;

const ListItemLink = props => <StyledListItem button component={RouterLink} {...props} />;

const ListItemButton = props => {
  const history = useHistory();

  const handleClick = () => {
    FakeStore.auth.logout().then(() => {
      history.push('/login');
    });
  };
  return <StyledListItem button {...props} onClick={handleClick} />;
};

const ProfileLinks = () => {
  return (
    <React.Fragment>
      <ListItemLink to="/profile">
        <MuiListItemIcon>
          <AccountCircleIcon />
        </MuiListItemIcon>
        <MuiListItemText primary="Profile" />
      </ListItemLink>
      <ListItemButton>
        <MuiListItemIcon>
          <ExitToAppIcon />
        </MuiListItemIcon>
        <MuiListItemText primary="Logout" />
      </ListItemButton>
    </React.Fragment>
  );
};

export const ProfileButton = () => (
  <LightProfileButton startIcon={<Avatar>T</Avatar>} ListItems={ProfileLinks}>
    Tom
  </LightProfileButton>
);
