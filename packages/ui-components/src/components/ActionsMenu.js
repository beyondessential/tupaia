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
    width: 135px;
    border: 1px solid ${props => props.theme.palette.grey['400']};
    border-radius: 3px;
    overflow: visible;

    .MuiList-root {
      padding-top: 4px;
      padding-bottom: 4px;
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
  padding-top: 10px;
  padding-bottom: 10px;

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

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <IconButton onClick={handleClick}>
        <StyledMenuIcon />
      </IconButton>
      <StyledMenu
        keepMounted
        disablePortal
        getContentAnchorEl={null}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: -85,
        }}
      >
        {options.map(({ label, action }) => (
          <StyledMenuItem
            key={label}
            onClick={() => {
              action();
              return handleClose();
            }}
          >
            {label}
          </StyledMenuItem>
        ))}
      </StyledMenu>
    </React.Fragment>
  );
};

ActionsMenu.propTypes = {
  options: PropTypes.array.isRequired,
};
