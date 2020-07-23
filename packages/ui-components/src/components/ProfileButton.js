/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import MuiButton from '@material-ui/core/Button';
import MuiMenu from '@material-ui/core/Menu';
import PropTypes from 'prop-types';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Avatar from '@material-ui/core/Avatar';
import MuiListSubheader from '@material-ui/core/ListSubheader';
import MuiList from '@material-ui/core/List';

const StyledButton = styled(MuiButton)`
  .MuiAvatar-root {
    height: 30px;
    width: 30px;
  }

  .MuiAvatar-root {
    color: ${props => props.theme.palette.text.primary};
  }

  .MuiSvgIcon-root {
    transition: transform 0.3s ease;
  }
`;

const Menu = styled(MuiMenu)`
  .MuiMenu-list {
    padding: 0;
  }
`;

/*
 * Profile button
 */
export const ProfileButton = ({ children, listItems, ...props }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <StyledButton
        endIcon={<ExpandMore style={{ transform: anchorEl ? 'rotate(180deg)' : 'rotate(0)' }} />}
        startIcon={<Avatar />}
        onClick={handleClick}
        {...props}
      >
        {children}
      </StyledButton>
      <Menu
        keepMounted
        disablePortal
        getContentAnchorEl={null}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MuiList subheader={<MuiListSubheader>Profile</MuiListSubheader>}>{listItems}</MuiList>
      </Menu>
    </React.Fragment>
  );
};

ProfileButton.propTypes = {
  children: PropTypes.any.isRequired,
  listItems: PropTypes.any.isRequired,
};

export const LightProfileButton = styled(ProfileButton)`
  color: ${props => props.theme.palette.common.white};

  .MuiAvatar-root {
    color: white;
  }
`;
