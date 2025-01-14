import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { Button, Link, ListItem, ListItemProps } from '@material-ui/core';
import { RouterLink } from '../../components';
import { MOBILE_BREAKPOINT } from '../../constants';

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
  margin-top: 1rem;
  * {
    color: ${({ $secondaryColor }) => $secondaryColor};
  }
  @media screen and (min-width: ${MOBILE_BREAKPOINT}) {
    margin-top: 0;
  }
`;

const MenuItemStyles = css`
  text-transform: none;
  font-size: 1rem;
  font-weight: ${props => props.theme.typography.fontWeightRegular};
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

const MenuItemButton = styled(Button)`
  ${MenuItemStyles};
  justify-content: flex-start;
`;

const MenuItemLink = styled(Link)`
  ${MenuItemStyles};
`;

const MenuItemRouterLink = styled(RouterLink)`
  ${MenuItemStyles};
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
  externalLink?: boolean;
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
  externalLink = false,
}: MenuItemProps) => {
  const handleClickMenuItem = () => {
    if (onClick) onClick();
    onCloseMenu();
  };

  if (externalLink) {
    return (
      <MenuListItem $secondaryColor={secondaryColor}>
        <MenuItemLink href={href} onClick={handleClickMenuItem} target="_blank">
          {children}
        </MenuItemLink>
      </MenuListItem>
    );
  }

  if (modal || href) {
    return (
      <MenuListItem $secondaryColor={secondaryColor}>
        <MenuItemRouterLink to={href} modal={modal} target={target} onClick={handleClickMenuItem}>
          {children}
        </MenuItemRouterLink>
      </MenuListItem>
    );
  }

  return (
    <MenuListItem $secondaryColor={secondaryColor}>
      <MenuItemButton onClick={handleClickMenuItem}>{children}</MenuItemButton>
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
