/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import styled from 'styled-components';
import { Button, ListItem, ListItemProps } from '@material-ui/core';
import { RouterLink } from '../../components/RouterButton';

/**
 * Menulist is a component that displays a list of menu items for the hamburger menu
 */
const MenuListWrapper = styled.ul<{
  $secondaryColor?: string;
}>`
  list-style: none;
  margin-block-start: 0;
  margin-block-end: 0;
  padding-inline-start: 0;
  * {
    color: ${({ $secondaryColor }) => $secondaryColor};
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

const MenuItemLink = styled(RouterLink)`
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

type MenuListItemType = ListItemProps & {
  $secondaryColor?: string;
};

const MenuListItem = styled(ListItem)<{
  $secondaryColor?: string;
}>`
  padding: 0;
  color: ${({ $secondaryColor }) => $secondaryColor};
` as MenuListItemType;

interface MenuItemProps {
  href?: string;
  children: ReactNode;
  onClick?: () => void;
  onCloseMenu: () => void;
  secondaryColor?: string;
  target?: string;
  modal?: string;
}

// If is a link, use a link component, else a button so that we have correct semantic HTML
export const MenuItem = ({
  href,
  children,
  onClick,
  onCloseMenu,
  secondaryColor,
  target,
  modal,
}: MenuItemProps) => {
  const handleClickMenuItem = () => {
    if (onClick) onClick();
    onCloseMenu();
  };
  return (
    <MenuListItem $secondaryColor={secondaryColor}>
      {modal || href ? (
        <MenuItemLink to={href} modal={modal} target={target} onClick={handleClickMenuItem}>
          {children}
        </MenuItemLink>
      ) : (
        <MenuItemButton onClick={handleClickMenuItem}>{children}</MenuItemButton>
      )}
    </MenuListItem>
  );
};

interface MenuListProps {
  children: ReactNode;
  secondaryColor?: string;
}

export const MenuList = ({ children, secondaryColor }: MenuListProps) => {
  return <MenuListWrapper $secondaryColor={secondaryColor}>{children}</MenuListWrapper>;
};
