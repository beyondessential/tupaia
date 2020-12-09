/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * RootScreen
 *
 * Bare bones container that renders the map fixed in the background and controls vertical ratios
 * of Dashboard and MapDiv based on expanded state of Dashboard (through redux store)
 */

import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React from 'react';
import { selectIsEnlargedDialogVisible } from '../../../selectors';
import Map from '../../../containers/Map';
import { MapDiv } from '../../../components/MapDiv';
import TopBar from '../../../containers/TopBar';
import SidePanel from '../../../containers/SidePanel';
import { EnlargedDialog } from '../../../containers/EnlargedDialog';
import SessionExpiredDialog from '../../../containers/SessionExpiredDialog';
import OverlayDiv from '../../../containers/OverlayDiv';
import { OverlayContainer } from '../../../utils';
import { TOP_BAR_HEIGHT } from '../../../styles';
import './desktop-styles.css';

export const RootScreen = ({ enlargedDialogIsVisible }) => {
  return (
    <div>
      {/* The order here matters, Map must be added to the DOM body after FlexContainer */}
      <OverlayContainer>
        <TopBar />
        <div style={styles.contentWrapper}>
          <MapDiv />
          <SidePanel />
        </div>
        <OverlayDiv />
        <SessionExpiredDialog />
        {enlargedDialogIsVisible ? <EnlargedDialog /> : null}
      </OverlayContainer>
      <Map />
    </div>
  );
};

RootScreen.propTypes = {
  enlargedDialogIsVisible: PropTypes.bool,
};

RootScreen.defaultProps = {
  enlargedDialogIsVisible: false,
};

const styles = {
  contentWrapper: {
    display: 'flex',
    flexDirection: 'row',
    height: `calc(100% - ${TOP_BAR_HEIGHT}px`,
  },
};

const mapStateToProps = state => ({
  enlargedDialogIsVisible: !!selectIsEnlargedDialogVisible(state),
});

export default connect(mapStateToProps)(RootScreen);
