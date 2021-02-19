/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Typography,
  IconButton,
  Divider,
  Drawer,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';

import { Link as RouterLink } from 'react-router-dom';
import { Home, ImportContacts, ContactMail, Close, Menu } from '@material-ui/icons';
import { LightIconButton } from '@tupaia/ui-components';
import { FlexEnd } from './Layout';

const StyledList = styled(List)`
  width: 360px;

  .MuiListItem-gutters {
    padding-left: 32px;
    padding-right: 32px;
  }

  .MuiListItemIcon-root {
    min-width: 40px;
  }

  .MuiListItemText-primary {
    font-size: 18px;
    line-height: 140%;
  }
`;

const ListItemLink = props => <ListItem button component={RouterLink} {...props} />;

const MenuSection = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  margin-right: 1.2rem;
  padding-right: 0.3rem;
  margin-left: -1.3rem;
  border-right: 1px solid rgba(0, 0, 0, 0.2);

  .MuiIconButton-root {
    padding: 1rem;
  }
`;

const MenuTray = styled(FlexEnd)`
  padding: 6px 6px 0 0;
  margin-bottom: -6px;
`;

const StyledDivider = styled(Divider)`
  margin: 6px 30px;
`;

const MenuHeading = styled(Typography)`
  font-weight: normal;
  font-size: 32px;
  line-height: 140%;
  margin-bottom: 0.5rem;
`;

const TupaiaText = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  margin-top: 8px;
  font-size: 12px;
  line-height: 140%;
`;

export const MainMenu = () => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = isOpen => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setOpen(isOpen);
  };

  return (
    <>
      <MenuSection>
        <LightIconButton onClick={toggleDrawer(true)}>
          <Menu />
        </LightIconButton>
      </MenuSection>

      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <MenuTray>
          <IconButton color="inherit" onClick={toggleDrawer(false)}>
            <Close />
          </IconButton>
        </MenuTray>
        <StyledList onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <ListItem>
            <MenuHeading variant="h3">Menu</MenuHeading>
          </ListItem>
          <ListItemLink to="/">
            <ListItemIcon>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemLink>
          <ListItemLink to="/about">
            <ListItemIcon>
              <ImportContacts />
            </ListItemIcon>
            <ListItemText primary="About LESMIS" />
          </ListItemLink>
          <ListItemLink to="/contact">
            <ListItemIcon>
              <ContactMail />
            </ListItemIcon>
            <ListItemText primary="Contact us" />
          </ListItemLink>
        </StyledList>
        <StyledDivider />
        <StyledList component="nav" aria-label="secondary mailbox folders">
          <ListItem>
            <TupaiaText>
              Powered by <Link href="https://tupaia.org">Tupaia</Link>
            </TupaiaText>
          </ListItem>
        </StyledList>
      </Drawer>
    </>
  );
};
