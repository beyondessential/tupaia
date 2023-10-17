/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { CSSProperties } from 'react';
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

const StyledMenu = styled(MuiMenu)`
  // .MuiPaper-root {
  //   position: absolute;
  //   display: inline-block;
  //   min-width: 8.5rem;
  //   border: 1px solid ${props => props.theme.palette.grey['400']};
  //   border-radius: 3px;
  //   overflow: visible;

  //   // .MuiList-root {
  //   //   padding-top: 0.25rem;
  //   //   padding-bottom: 0.25rem;
  //   // }

  //   // &:before,
  //   // &:after {
  //   //   position: absolute;
  //   //   content: '';

  //   //   // border-right: 10px solid transparent;
  //   //   // border-left: 10px solid transparent;
  //   // }

  //   &:before {
  //     top: -9px;
  //     z-index: 1;
  //     border-bottom: 10px solid white;
  //   }

  //   &:after {
  //     top: -10px;
  //     z-index: -1;
  //     border-bottom: 10px solid ${props => props.theme.palette.grey['400']};
  //   }
  // }
`;

const StyledMenuItem = styled(MuiMenuItem)`
  padding-top: 0.625rem;
  padding-bottom: 0.625rem;

  :not(:last-child) {
    border-bottom: 1px solid ${props => props.theme.palette.grey['400']};
  }
`;

const StyledMenuIcon = styled(MoreVertIcon)`
  color: ${props => props.theme.palette.text.tertiary};

  &:hover {
    color: ${props => props.theme.palette.text.primary};
  }
`;

interface Option {
  label: string;
  action: () => void;
  style?: CSSProperties;
  ActionIcon?: React.ElementType;
  toolTipTitle?: string;
  color?: string;
}

export const ActionsMenu = ({ options }: { options: Option[] }, includesIcons = false) => {
  const [anchorEl, setAnchorEl] = React.useState<(EventTarget & HTMLButtonElement) | null>(null);
  return (
    <>
      <IconButton aria-label="open" onClick={event => setAnchorEl(event.currentTarget)}>
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
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        {options.map(({ label, action, style, ActionIcon, toolTipTitle, color }: Option) => (
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
                <ListItemIcon>
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
        ))}
      </StyledMenu>
    </>
  );
};
