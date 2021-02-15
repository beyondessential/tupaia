/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { fade, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';
import { HomeButton } from '@tupaia/ui-components';

import { ProfileButton } from './ProfileButton';

export const NavBar = () => (
  <AppBar position="static">
    <Toolbar>
      <IconButton edge="start" color="inherit" aria-label="open drawer">
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" noWrap>
        Material-UI
      </Typography>
      <div>
        <div>
          <SearchIcon />
        </div>
        <InputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} />
      </div>
    </Toolbar>
  </AppBar>
);
