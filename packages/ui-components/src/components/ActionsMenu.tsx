/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import {
  ListItemIcon,
  MenuItem as MuiMenuItem,
  Menu as MuiMenu,
  IconButton,
  Typography,
  Tooltip,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import styled from 'styled-components';
import { ActionsMenuOptionType } from '../types';

const StyledMenuItem = styled(MuiMenuItem)`
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;
`;

const StyledMenuIcon = styled(MoreVertIcon)`
  color: ${props => props.theme.palette.text.tertiary};

  &:hover {
    color: ${props => props.theme.palette.text.primary};
  }
`;

type ActionMenuProps = {
  options: ActionsMenuOptionType[];
  includesIcons?: boolean;
  anchorOrigin?: {
    vertical?: 'top' | 'bottom';
    horizontal?: 'left' | 'right';
  };
  transformOrigin?: {
    vertical?: 'top' | 'bottom';
    horizontal?: 'left' | 'right';
  };
};

export const ActionsMenu = ({
  options,
  includesIcons = false,
  anchorOrigin = {},
  transformOrigin = {},
}: ActionMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<(EventTarget & HTMLButtonElement) | null>(null);
  return (
    <>
      <IconButton aria-label="open" onClick={event => setAnchorEl(event.currentTarget)}>
        <StyledMenuIcon />
      </IconButton>
      <MuiMenu
        keepMounted
        disablePortal
        getContentAnchorEl={null}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
          ...anchorOrigin,
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top', ...transformOrigin }}
      >
        {options.map(
          ({
            label,
            action,
            style,
            iconStyle,
            ActionIcon,
            toolTipTitle,
            color,
          }: ActionsMenuOptionType) => (
            <StyledMenuItem
              role="button"
              key={label}
              style={style}
              onClick={() => {
                action();
                setAnchorEl(null);
              }}
            >
              {includesIcons && ActionIcon ? (
                <>
                  <ListItemIcon style={iconStyle}>
                    <ActionIcon fontSize="small" color={color} />
                  </ListItemIcon>
                  <Tooltip title={toolTipTitle || ''} arrow>
                    <Typography display="inline" variant="inherit">
                      {label}
                    </Typography>
                  </Tooltip>
                </>
              ) : (
                label
              )}
            </StyledMenuItem>
          ),
        )}
      </MuiMenu>
    </>
  );
};
