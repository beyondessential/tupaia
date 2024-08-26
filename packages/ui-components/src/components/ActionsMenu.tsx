/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import {
  IconButton as MuiIconButton,
  ListItemIcon,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  Tooltip,
  Typography,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import styled from 'styled-components';
import { ActionsMenuOptionType } from '../types';

const StyledMenu = styled(MuiMenu)`
  .MuiPaper-root {
    border: 1px solid ${props => props.theme.palette.divider};
  }
  .MuiList-root {
    padding: 0.2rem;
  }
`;

const StyledMenuItem = styled(MuiMenuItem)`
  padding: 0.3rem 0.3rem;
  font-size: 0.75rem;
  min-width: 5rem;
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
  IconButton?: typeof MuiIconButton;
};

export const ActionsMenu = ({
  options,
  includesIcons = false,
  anchorOrigin = {},
  transformOrigin = {},
  IconButton = MuiIconButton,
}: ActionMenuProps) => {
  const [anchorEl, setAnchorEl] = React.useState<(EventTarget & HTMLButtonElement) | null>(null);
  return (
    <>
      <IconButton aria-label="Open menu" onClick={event => setAnchorEl(event.currentTarget)}>
        <StyledMenuIcon />
      </IconButton>
      <StyledMenu
        keepMounted
        disablePortal
        getContentAnchorEl={null}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
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
      </StyledMenu>
    </>
  );
};
