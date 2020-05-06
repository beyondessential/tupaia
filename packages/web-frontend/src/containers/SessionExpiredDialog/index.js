/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * SessionExpiredDialog
 *
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { finishUserSession } from '../../actions';

export class SessionExpiredDialog extends PureComponent {
  render() {
    const { showSessionExpireDialog, onConfirmSessionExpired, style, ...otherProps } = this.props;
    const actions = [<FlatButton label="OK" primary onClick={() => onConfirmSessionExpired()} />];
    return (
      <Dialog
        {...otherProps}
        style={{ zIndex: 3000, ...style }}
        title="Session expired"
        actions={actions}
        modal
        open={showSessionExpireDialog}
      >
        Your session has expired. You will be redirected to the public page.
      </Dialog>
    );
  }
}

SessionExpiredDialog.propTypes = {
  showSessionExpireDialog: PropTypes.bool,
  onConfirmSessionExpired: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const { showSessionExpireDialog } = state.authentication;

  return {
    showSessionExpireDialog,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onConfirmSessionExpired: () => dispatch(finishUserSession()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SessionExpiredDialog);
