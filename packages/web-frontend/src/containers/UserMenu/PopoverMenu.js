import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { ListItem, Button, Popover, Link } from '@material-ui/core';

const MenuItemButton = styled(Button)`
  text-transform: none;
  font-size: 1rem;
  font-weight: ${props => props.theme.typography.fontWeightRegular};
  padding: 0.4em 1em;
  line-height: 1.4;
  width: 100%;
  justify-content: flex-start;
`;
const MenuItemLink = styled(Link)`
  font-size: 1rem;
  padding: 0.4em 1em;
  line-height: 1.4;
  width: 100%;
  color: inherit;
  text-decoration: none;
  &:hover,
  &:focus {
    text-decoration: none;
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

const MenuList = styled.ul`
  list-style: none;
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0;
`;

const MenuListItem = styled(ListItem)`
  padding: 0;
`;
const MenuItem = ({ type, children, ...props }) =>
  type === 'link' ? (
    <MenuItemLink {...props} target="_blank">
      {children}
    </MenuItemLink>
  ) : (
    <MenuItemButton {...props}>{children}</MenuItemButton>
  );
MenuItem.propTypes = {
  type: PropTypes.oneOf(['link', 'button']),
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
};

MenuItem.defaultProps = {
  type: 'button',
};

export const PopoverMenu = ({ menuItems, primaryColor, menuOpen, onCloseMenu }) => {
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
    <MenuList>
      {menuItems.map(({ action, text, type, url }) => (
        <MenuListItem key={text}>
          <MenuItem
            type={type}
            onClick={() => {
              if (action) action();
              onCloseMenu();
            }}
            href={url}
          >
            {text}
          </MenuItem>
        </MenuListItem>
      ))}
    </MenuList>
  </Popover>;
};
