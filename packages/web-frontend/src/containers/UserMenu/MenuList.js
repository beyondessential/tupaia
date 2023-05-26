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
  * {
    color: ${({ secondaryColor }) => secondaryColor};
  }
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
  text-decoration: none;
  &:hover,
  &:focus {
    text-decoration: none;
    background-color: rgba(255, 255, 255, 0.08);
  }
`;

const MenuListItem = styled(ListItem)`
  padding: 0;
  color: ${({ secondaryColor }) => secondaryColor};
`;

// If is a link, use a link component, else a button so that we have correct semantic HTML
export const MenuItem = ({ href, children, onClick, onCloseMenu, secondaryColor }) => {
  const handleClickMenuItem = () => {
    if (onClick) onClick();
    onCloseMenu();
  };
  return (
    <MenuListItem>
      {href ? (
        <MenuItemLink href={href} target="_blank" onClick={handleClickMenuItem}>
          {children}
        </MenuItemLink>
      ) : (
        <MenuItemButton onClick={handleClickMenuItem}>{children}</MenuItemButton>
      )}
    </MenuListItem>
  );
};

MenuItem.propTypes = {
  href: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  onCloseMenu: PropTypes.func.isRequired,
  onClick: PropTypes.func,
};

MenuItem.defaultProps = {
  href: null,
  onClick: null,
};

export const MenuList = ({ children, secondaryColor }) => {
  return <MenuListWrapper secondaryColor={secondaryColor}>{children}</MenuListWrapper>;
};

MenuList.propTypes = {
  children: PropTypes.node.isRequired,
  secondaryColor: PropTypes.string.isRequired,
};
