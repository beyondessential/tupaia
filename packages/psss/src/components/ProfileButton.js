/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import MuiListItem from '@material-ui/core/ListItem';
import { Link as RouterLink } from 'react-router-dom';
import MuiListItemIcon from '@material-ui/core/ListItemIcon';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import MuiListItemText from '@material-ui/core/ListItemText';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import Avatar from '@material-ui/core/Avatar';
import { LightProfileButton } from '@tupaia/ui-components';
import { getCurrentUser, logout } from '../store';

const StyledListItem = styled(MuiListItem)`
  padding-right: 3rem;
`;

const ListItemLink = props => <StyledListItem button component={RouterLink} {...props} />;

const ProfileLinks = ({ onLogout }) => {
  const handleClickLogout = () => {
    onLogout();
  };

  return (
    <React.Fragment>
      <ListItemLink to="/profile">
        <MuiListItemIcon>
          <AccountCircleIcon />
        </MuiListItemIcon>
        <MuiListItemText primary="Profile" />
      </ListItemLink>
      <StyledListItem button onClick={handleClickLogout}>
        <MuiListItemIcon>
          <ExitToAppIcon />
        </MuiListItemIcon>
        <MuiListItemText primary="Logout" />
      </StyledListItem>
    </React.Fragment>
  );
};

ProfileLinks.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

const ProfileButtonComponent = ({ onLogout, user }) => {
  const firstLetter = user.name.substring(0, 1);

  return (
    <LightProfileButton
      startIcon={<Avatar>{firstLetter}</Avatar>}
      listItems={<ProfileLinks onLogout={onLogout} />}
    >
      {user.name}
    </LightProfileButton>
  );
};

ProfileButtonComponent.propTypes = {
  onLogout: PropTypes.func.isRequired,
  user: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  user: getCurrentUser(state),
});

const mapDispatchToProps = dispatch => ({
  onLogout: () => dispatch(logout()),
});

export const ProfileButton = connect(mapStateToProps, mapDispatchToProps)(ProfileButtonComponent);
