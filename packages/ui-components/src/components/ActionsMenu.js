/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import MuiMenu from '@material-ui/core/Menu';
import MuiMenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import styled from 'styled-components';

const StyledMenu = styled(MuiMenu)`
  .MuiPaper-root {
    position: relative;
    width: 8.5rem;
    border: 1px solid ${props => props.theme.palette.grey['400']};
    border-radius: 3px;
    overflow: visible;

    .MuiList-root {
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
    }

    &:before,
    &:after {
      position: absolute;
      content: '';
      right: 15px;
      border-right: 10px solid transparent;
      border-left: 10px solid transparent;
    }

    &:before {
      top: -9px;
      z-index: 1;
      border-bottom: 10px solid white;
    }

    &:after {
      top: -10px;
      z-index: -1;
      border-bottom: 10px solid ${props => props.theme.palette.grey['400']};
    }
  }
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

export const ActionsMenu = ({ options }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
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
          horizontal: -85,
        }}
      >
        {options.map(({ label, action, style }) => (
          <StyledMenuItem
            role="button"
            key={label}
            style={style}
            onClick={() => {
              action();
              setAnchorEl(null);
            }}
          >
            {label}
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </>
  );
};

ActionsMenu.propTypes = {
  options: PropTypes.array.isRequired,
};
