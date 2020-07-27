/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * SidePanel
 *
 * Visual flex expandable div to show Information on the bottom.
 * Switchs between showing Dashboard and TupaiaInfo.
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';

import CloseIcon from 'material-ui/svg-icons/navigation/close';
import styled from 'styled-components';
import { isMobile } from '../../utils';
import { DARK_BLUE, DIALOG_Z_INDEX } from '../../styles';
import { setOverlayComponent } from '../../actions';
import { LandingPage } from './components/LandingPage';
import { RequestProjectAccess } from './components/RequestProjectAccess';
import Disaster from './components/Disaster';
import { OVERLAY_PADDING, LANDING, DISASTER, REQUEST_PROJECT_ACCESS } from './constants';

const styles = {
  dialogContainer: {
    zIndex: DIALOG_Z_INDEX,
  },
  dialog: {
    backgroundColor: DARK_BLUE,
    padding: 0,
    color: 'rgba(255,255,255,0.9)',
    overflowY: 'auto',
    maxWidth: 920,
    // Prevent width from animating.
    transition: 'transform 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
  },
  close: {
    position: 'absolute',
    top: 5,
    right: 5,
    cursor: 'pointer',
  },
};

const Wrapper = styled.div`
  padding: ${OVERLAY_PADDING};
  text-align: center;
  position: relative;
  overflow-x: hidden;
`;

export class OverlayDiv extends PureComponent {
  render() {
    const { overlay, closeOverlay, isUserLoggedIn } = this.props;
    const components = {
      [LANDING]: () => <LandingPage isUserLoggedIn={isUserLoggedIn} transition />,
      [DISASTER]: Disaster,
      [REQUEST_PROJECT_ACCESS]: RequestProjectAccess,
    };
    const OverlayComponent = components[overlay];

    return (
      <Dialog
        open={!!overlay}
        style={styles.dialogContainer}
        PaperProps={{ style: styles.dialog }}
        onClose={closeOverlay}
        fullScreen={isMobile()}
        fullWidth={isMobile()}
      >
        <Wrapper>
          <CloseIcon data-testid="overlay-close-btn" style={styles.close} onClick={closeOverlay} />
          {overlay && <OverlayComponent />}
        </Wrapper>
      </Dialog>
    );
  }
}

OverlayDiv.propTypes = {
  overlay: PropTypes.node,
  closeOverlay: PropTypes.func.isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
};

OverlayDiv.defaultProps = {
  overlay: null,
};

const mapStateToProps = state => {
  return {
    overlay: state.global.overlay,
    isUserLoggedIn: state.authentication.isUserLoggedIn,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    closeOverlay: () => {
      dispatch(setOverlayComponent(null));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OverlayDiv);
