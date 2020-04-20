/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';
import MuiListItemText from '@material-ui/core/ListItemText';
import MuiList from '@material-ui/core/List';
import MuiMenu from '@material-ui/core/Menu';
import MuiListItemIcon from '@material-ui/core/ListItemIcon';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { Link as RouterLink } from 'react-router-dom';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import MuiListItem from '@material-ui/core/ListItem';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Avatar from '@material-ui/core/Avatar';
import MuiListSubheader from '@material-ui/core/ListSubheader';
import * as COLORS from '../theme/colors';

const StyledListItem = styled(MuiListItem)`
  padding-right: 3rem;
`;

const ListItemLink = props => <StyledListItem button component={RouterLink} {...props} />;

const StyledButton = styled(MuiButton)`
  .MuiAvatar-root {
    height: 30px;
    width: 30px;
  }

  .MuiAvatar-root {
    color: ${COLORS.TEXTGREY};
  }
`;

const Menu = styled(MuiMenu)`
  .MuiMenu-list {
    padding: 0;
  }
`;

/*
 * Profile button
 */
export const ProfileButton = props => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <StyledButton
        endIcon={<ExpandMore />}
        startIcon={<Avatar />}
        onClick={handleClick}
        {...props}
      />
      <Menu keepMounted anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MuiList subheader={<MuiListSubheader>Profile</MuiListSubheader>}>
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
        </MuiList>
      </Menu>
    </React.Fragment>
  );
};

export const LightProfileButton = styled(ProfileButton)`
  color: ${COLORS.WHITE};

  .MuiAvatar-root {
    color: white;
  }
`;
