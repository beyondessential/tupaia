import {
  ListItemIcon,
  IconButton as MuiIconButton,
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  Tooltip,
  Typography,
} from '@material-ui/core';
import { EllipsisVertical } from 'lucide-react';
import React from 'react';
import styled from 'styled-components';
import { ActionsMenuOptionType } from '../types';
import { VisuallyHidden } from './VisuallyHidden';

const StyledMenu = styled(MuiMenu)`
  .MuiPaper-root {
    border: max(0.0625rem, 1px) solid ${props => props.theme.palette.divider};
    min-inline-size: 8rem;
  }
  .MuiList-root {
    padding: 0.2rem;
  }
`;

const StyledMenuItem = styled(MuiMenuItem)`
  ${props => props.theme.breakpoints.up('md')} {
    font-size: 0.75rem;
    padding: 0.5rem;
  }
`;

const StyledMenuIcon = styled(EllipsisVertical)`
  font-size: 1.5rem;
  color: ${props => props.theme.palette.text.tertiary};

  &:hover {
    color: ${props => props.theme.palette.text.primary};
  }
`;

interface ActionMenuProps {
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
}

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
      <IconButton onClick={event => setAnchorEl(event.currentTarget)}>
        <StyledMenuIcon aria-hidden />
        <VisuallyHidden>Open menu</VisuallyHidden>
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
