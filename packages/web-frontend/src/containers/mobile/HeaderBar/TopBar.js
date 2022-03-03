/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MenuIcon from '@material-ui/icons/Menu';
import UserIcon from '@material-ui/icons/AccountCircle';

import { WHITE } from '../../../styles';
import { TUPAIA_LIGHT_LOGO_SRC } from '../../../constants';

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-bottom: 1px solid #000;
`;

const Toolbar = styled.div`
  align-self: center;
`;

const ToolbarButton = styled.button`
  outline: 0;
  border: 0;
  background: none;
  border-radius: 4px;
  vertical-align: top;
  color: ${WHITE};

  &:focus {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    vertical-align: middle;
    margin-left: 5px;
    margin-top: -1px;
  }
`;

export const TopBar = ({
  currentUserUsername,
  isUserLoggedIn,
  toggleMenuExpanded,
  toggleUserMenuExpand,
}) => {
  return (
    <Header>
      <a href="/">
        <img src={TUPAIA_LIGHT_LOGO_SRC} alt="Tupaia logo" width="70" height="30" />
      </a>
      <Toolbar>
        {isUserLoggedIn ? (
          <ToolbarButton onClick={toggleUserMenuExpand}>
            {currentUserUsername}
            <MenuIcon />
          </ToolbarButton>
        ) : (
          <ToolbarButton onClick={toggleMenuExpanded}>
            Sign In / Register
            <UserIcon />
          </ToolbarButton>
        )}
      </Toolbar>
    </Header>
  );
};

TopBar.propTypes = {
  currentUserUsername: PropTypes.string.isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
  toggleMenuExpanded: PropTypes.func.isRequired,
  toggleUserMenuExpand: PropTypes.func.isRequired,
};
