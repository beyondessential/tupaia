import { Popover as MuiPopover } from '@material-ui/core';
import React from 'react';
import styled from 'styled-components';
import { MOBILE_BREAKPOINT } from '../../constants';
import { MenuList } from './MenuList';

/**
 * PopoverMenu is a popover menu used when the user is on a desktop device
 */

const Popover = styled(MuiPopover)`
  @media screen and (max-width: ${MOBILE_BREAKPOINT}) {
    display: none;
  }
`;

interface PopoverMenuProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Popover>,
    'open' | 'onClose' | 'anchorEl' | 'anchorOrigin' | 'transformOrigin' | 'PaperProps'
  > {
  controlledById: string;
  primaryColor?: string;
  secondaryColor?: string;
  menuOpen: boolean;
  onCloseMenu: () => void;
}

export const PopoverMenu = ({
  controlledById,
  children,
  primaryColor,
  menuOpen,
  onCloseMenu,
  secondaryColor,
  ...props
}: PopoverMenuProps) => {
  return (
    <Popover
      {...props}
      PaperProps={{
        style: {
          backgroundColor: primaryColor,
        },
      }}
      open={menuOpen}
      anchorEl={() => document.getElementById(controlledById) as HTMLElement}
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
      <MenuList secondaryColor={secondaryColor}>{children}</MenuList>
    </Popover>
  );
};
