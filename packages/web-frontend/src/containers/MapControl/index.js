/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * MapControl
 *
 * The controls for map zoom and tile layer.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import SatelliteOnIcon from 'material-ui/svg-icons/action/visibility';
import SatelliteOffIcon from 'material-ui/svg-icons/action/visibility-off';
import FlatButton from 'material-ui/FlatButton';
import { changeZoom, changeTileSet } from '../../actions';
import { OFF_WHITE, TRANS_BLACK_LESS, BOX_SHADOW } from '../../styles';

export class MapControl extends Component {
  render() {
    const { currentSetKey, onZoomInClick, onZoomOutClick, onVisibilityClick } = this.props;

    const visibilityIcon = currentSetKey === 'osm' ? <SatelliteOffIcon /> : <SatelliteOnIcon />;
    const visiblityChangeKey = currentSetKey === 'osm' ? 'satellite' : 'osm';
    return (
      <div style={styles.container}>
        <div style={styles.upperContainer}>
          <FlatButton
            fullWidth
            onClick={() => onVisibilityClick(visiblityChangeKey)}
            icon={visibilityIcon}
          />
        </div>

        <div style={styles.lowerContainer}>
          <FlatButton label="+" fullWidth labelStyle={styles.label} onClick={onZoomInClick} />
          <hr style={styles.divider} />
          <FlatButton label="-" fullWidth labelStyle={styles.label} onClick={onZoomOutClick} />
        </div>
      </div>
    );
  }
}

const styles = {
  container: {
    alignSelf: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    width: '29px',
    flexWrap: 'no-wrap',
    pointerEvents: 'auto',
    cursor: 'auto',
    marginLeft: 'auto',
    marginBottom: 10,
  },
  label: {
    fontSize: 30,
    padding: 0,
  },
  upperContainer: {
    borderRadius: '2px',
    marginBottom: '2px',
    backgroundColor: TRANS_BLACK_LESS,
    boxShadow: BOX_SHADOW,
  },
  divider: {
    width: '60%',
    color: OFF_WHITE,
    margin: 5,
  },
  lowerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexWrap: 'no-wrap',
    borderRadius: '2px',
    backgroundColor: TRANS_BLACK_LESS,
    boxShadow: BOX_SHADOW,
  },
};

MapControl.propTypes = {
  currentSetKey: PropTypes.string,
  onZoomInClick: PropTypes.func.isRequired,
  onZoomOutClick: PropTypes.func.isRequired,
  onVisibilityClick: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
  const currentSetKey = state.map.tileSet;
  return { currentSetKey };
};

const mapDispatchToProps = dispatch => {
  return {
    onZoomInClick: () => dispatch(changeZoom(1)),
    onZoomOutClick: () => dispatch(changeZoom(-1)),
    onVisibilityClick: setKey => dispatch(changeTileSet(setKey)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MapControl);
