/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Button, Link, ListItem } from '@material-ui/core';

/**
 * Menulist is a component that displays a list of menu items for the hamburger menu
 */
const MenuListWrapper = styled.ul`
  list-style: none;
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0;
`;

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

const MenuListItem = styled(ListItem)`
  padding: 0;
`;

// If is a link, use a link component, else a button so that we have correct semantic HTML
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

export const MenuList = ({ menuItems, closeMenu }) => {
  return (
    <MenuListWrapper>
      {menuItems.map(({ type, actionText, url, action, preText }) => (
        <MenuListItem key={actionText}>
          <MenuItem
            type={type}
            onClick={() => {
              if (action) action();
              closeMenu();
            }}
            href={url}
          >
            {preText}
            <span>{actionText}</span>
          </MenuItem>
        </MenuListItem>
      ))}
    </MenuListWrapper>
  );
};

MenuList.propTypes = {
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string,
      actionText: PropTypes.string,
      action: PropTypes.func,
      preText: PropTypes.string,
      type: PropTypes.oneOf(['link', 'button']),
    }),
  ).isRequired,
  closeMenu: PropTypes.func.isRequired,
};
