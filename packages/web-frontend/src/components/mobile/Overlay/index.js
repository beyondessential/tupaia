/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import modalSlideTransition from 'react-animations/lib/fade-in-up';
import Radium from 'radium';

import {
  DARK_BLUE,
  LEAFLET_Z_INDEX,
  MOBILE_HEADER_HEIGHT,
  MOBILE_MARGIN_SIZE,
  WHITE,
} from '../../../styles';

const Overlay = ({ titleText, titleElement, children, onClose, contentStyle }) => (
  <div style={styles.overlay}>
    <div style={styles.header}>
      {titleElement || <div style={styles.title}>{titleText}</div>}
      <button type="button" style={styles.closeButton} onClick={onClose}>
        <CloseIcon />
      </button>
    </div>
    <div style={[styles.content, contentStyle]}>{children}</div>
  </div>
);

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: LEAFLET_Z_INDEX + 1, // above leaflet map
    display: 'flex',
    flexDirection: 'column',
    animation: 'x 0.3s',
    animationName: Radium.keyframes(modalSlideTransition, 'modalSlideTransition'),
  },
  header: {
    display: 'flex',
    position: 'relative',
    backgroundColor: DARK_BLUE,
    color: WHITE,
    height: MOBILE_HEADER_HEIGHT,
  },
  title: {
    padding: MOBILE_MARGIN_SIZE,
    flexGrow: 1,
    fontSize: 20,
  },
  closeButton: {
    border: 0,
    outline: 0,
    appearance: 'none',
    padding: `0px ${MOBILE_MARGIN_SIZE}px`,
    background: 'none',
  },
  content: {
    background: WHITE,
    flex: 1,
    overflow: 'auto',
  },
};

Overlay.propTypes = {
  titleText: PropTypes.string,
  titleElement: PropTypes.node,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  onClose: PropTypes.func.isRequired,
  contentStyle: PropTypes.object,
};

Overlay.defaultProps = {
  titleText: '',
  titleElement: null,
  children: null,
  contentStyle: {},
};

export default Radium(Overlay);
