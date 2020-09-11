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
import { setOverlayComponent, setOrgUnit } from '../../actions';
import { setProject } from '../../projects/actions';
import { LandingPage } from './components/LandingPage';
import { ProjectLandingPage } from './components/ProjectLandingPage';
import { RequestProjectAccess } from './components/RequestProjectAccess';
import Disaster from './components/Disaster';
import { selectProjectByCode, selectCurrentProject } from '../../selectors';
import { LANDING, PROJECT_LANDING, DISASTER, REQUEST_PROJECT_ACCESS } from './constants';

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
  text-align: center;
  position: relative;
  overflow-x: hidden;
`;

export class OverlayDiv extends PureComponent {
  render() {
    const {
      overlay,
      closeOverlay,
      isUserLoggedIn,
      selectExploreProject,
      selectProjectOrgUnit,
      viewProjectList,
      activeProject,
    } = this.props;

    const scrollToTop = () => {
      document.getElementById('overlay-wrapper').scrollTop = 0;
    };

    const components = {
      [LANDING]: () => <LandingPage isUserLoggedIn={isUserLoggedIn} transition />,
      [PROJECT_LANDING]: () => (
        <ProjectLandingPage
          selectExplore={selectExploreProject}
          viewProjects={viewProjectList}
          project={activeProject}
          viewProjectOrgUnit={selectProjectOrgUnit}
          scrollToTop={scrollToTop}
        />
      ),
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
        <Wrapper id="overlay-wrapper">
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
  viewProjectList: PropTypes.func.isRequired,
  activeProject: PropTypes.shape({}),
  selectExploreProject: PropTypes.func.isRequired,
  selectProjectOrgUnit: PropTypes.func.isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
};

OverlayDiv.defaultProps = {
  overlay: null,
  activeProject: null,
};

const mapStateToProps = state => {
  const exploreProject = selectProjectByCode(state, 'explore');
  const activeProject = selectCurrentProject(state);

  return {
    overlay: state.global.overlay,
    isUserLoggedIn: state.authentication.isUserLoggedIn,
    activeProject,
    exploreProject,
  };
};

const mergeProps = (stateProps, { dispatch }, ownProps) => ({
  ...ownProps,
  ...stateProps,
  selectExploreProject: () => {
    dispatch(setProject(stateProps.exploreProject.code));
    dispatch(setOverlayComponent(null));
  },
  selectProjectOrgUnit: () => {
    dispatch(setOverlayComponent(null));
    dispatch(setOrgUnit(stateProps.activeProject.homeEntityCode, false));
  },
  viewProjectList: () => dispatch(setOverlayComponent(LANDING)),
  closeOverlay: () => {
    dispatch(setOverlayComponent(null));
  },
});

export default connect(mapStateToProps, null, mergeProps)(OverlayDiv);
