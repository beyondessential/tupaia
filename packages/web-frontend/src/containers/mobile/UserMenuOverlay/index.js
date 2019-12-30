/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';

import {
  attemptUserLogout,
  openUserPage,
  closeUserPage,
  DIALOG_PAGE_CHANGE_PASSWORD,
  DIALOG_PAGE_REQUEST_COUNTRY_ACCESS,
} from '../../../actions';
import Overlay from '../../../components/mobile/Overlay';
import { delayMobileTapCallback } from '../../../utils';
import { DARK_BLUE } from '../../../styles';

const ButtonList = styled.div`
  display: grid;

  button {
    padding: 10px;
    border-left: none;
    border-right: none;
    border-radius: none;

    :not(:first-child):not(:last-child) {
      border: none;
    }
  }
`;

class UserMenuOverlay extends Component {
  renderMenuButton = (label, onClick) => {
    return (
      <Button variant="outlined" fullWidth onClick={onClick}>
        {label}
      </Button>
    );
  };

  render() {
    const {
      onToggleChangePasswordExpand,
      onToggleRequestCountryAccessExpand,
      onAttemptUserLogout,
      onClose,
    } = this.props;

    return (
      <Overlay titleText="Your Account" onClose={onClose} contentStyle={styles.overlayContent}>
        <ButtonList>
          {this.renderMenuButton('Change Password', onToggleChangePasswordExpand)}
          {this.renderMenuButton('Request Country Access', onToggleRequestCountryAccessExpand)}
          {this.renderMenuButton('Log out', onAttemptUserLogout)}
        </ButtonList>
      </Overlay>
    );
  }
}

const styles = {
  overlayContent: {
    background: DARK_BLUE,
    borderTop: '1px solid #111',
    textAlign: 'center',
  },
  loginActions: {
    textAlign: 'center',
  },
};

UserMenuOverlay.propTypes = {
  onToggleChangePasswordExpand: PropTypes.func,
  onToggleRequestCountryAccessExpand: PropTypes.func,
  onAttemptUserLogout: PropTypes.func,
  onClose: PropTypes.func,
};

UserMenuOverlay.defaultProps = {
  onToggleChangePasswordExpand: PropTypes.func.isRequired,
  onToggleRequestCountryAccessExpand: PropTypes.func.isRequired,
  onAttemptUserLogout: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  onToggleChangePasswordExpand: () =>
    delayMobileTapCallback(() => dispatch(openUserPage(DIALOG_PAGE_CHANGE_PASSWORD))),
  onToggleRequestCountryAccessExpand: () =>
    delayMobileTapCallback(() => dispatch(openUserPage(DIALOG_PAGE_REQUEST_COUNTRY_ACCESS))),
  onAttemptUserLogout: (emailAddress, password) =>
    delayMobileTapCallback(() => dispatch(attemptUserLogout(emailAddress, password))),
  onClose: () => dispatch(closeUserPage()),
});

export default connect(
  null,
  mapDispatchToProps,
)(UserMenuOverlay);
