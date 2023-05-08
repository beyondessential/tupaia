/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Popover } from '@material-ui/core';
import { MenuList } from './MenuList';

/**
 * PopoverMenu is a popover menu used when the user is on a desktop device
 */

export const PopoverMenu = ({ children, primaryColor, menuOpen, onCloseMenu }) => {
  return (
    <Popover
      PaperProps={{ style: { backgroundColor: primaryColor } }}
      open={menuOpen}
      anchorEl={() => document.getElementById('user-menu-button')}
      onClose={onCloseMenu}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <MenuList>{children}</MenuList>
    </Popover>
  );
};

PopoverMenu.propTypes = {
  children: PropTypes.node.isRequired,
  menuOpen: PropTypes.bool.isRequired,
  onCloseMenu: PropTypes.func.isRequired,
  primaryColor: PropTypes.string.isRequired,
};
