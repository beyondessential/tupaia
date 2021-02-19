/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography, IconButton, Drawer, List, ListItem } from '@material-ui/core';
import { Close, Favorite } from '@material-ui/icons';
import { FlexStart } from './Layout';

/** =================================
 * PLACEHOLDER
 * ================================= */

export const FavoritesButton = styled(IconButton)`
  color: white;
  margin-right: 0.5rem;

  .MuiSvgIcon-root {
    font-size: 2rem;
  }
`;

const StyledList = styled(List)`
  width: 480px;

  .MuiListItem-gutters {
    padding-left: 32px;
    padding-right: 32px;
  }
`;

const MenuTray = styled(FlexStart)`
  padding: 6px 0 0 6px;
`;

const MenuHeading = styled(Typography)`
  font-weight: normal;
  font-size: 32px;
  line-height: 140%;
  margin-bottom: 0.5rem;
`;

export const FavouritesMenu = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = isOpen => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setOpen(isOpen);
  };

  return (
    <>
      <FavoritesButton onClick={toggleDrawer(true)}>
        <Favorite />
      </FavoritesButton>
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        <MenuTray>
          <IconButton color="inherit" onClick={toggleDrawer(false)}>
            <Close />
          </IconButton>
        </MenuTray>
        <StyledList onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <ListItem>
            <MenuHeading variant="h3">Saved</MenuHeading>
          </ListItem>
        </StyledList>
      </Drawer>
    </>
  );
};
