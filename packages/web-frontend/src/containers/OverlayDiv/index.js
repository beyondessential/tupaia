/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MuiDialog from '@material-ui/core/Dialog';

import MuiCloseIcon from 'material-ui/svg-icons/navigation/close';
import styled from 'styled-components';
import { isMobile } from '../../utils';
import { DARK_BLUE, DIALOG_Z_INDEX } from '../../styles';
import { setOverlayComponent } from '../../actions';
import { setProject } from '../../projects/actions';
import { LandingPage } from './components/LandingPage';
import { ProjectLandingPage } from './components/ProjectLandingPage';
import { RequestProjectAccessDialog } from './components/RequestProjectAccessDialog';
import Disaster from './components/Disaster';
import { selectProjectByCode, selectCurrentProject } from '../../selectors';
import {
  LANDING,
  VIEW_PROJECTS,
  PROJECT_LANDING,
  DISASTER,
  REQUEST_PROJECT_ACCESS,
} from './constants';

const Wrapper = styled.div`
  text-align: center;
  position: relative;
  overflow-x: hidden;
`;

const CloseIcon = styled(MuiCloseIcon)`
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
`;

const Dialog = props => (
  <MuiDialog
    style={{
      zIndex: DIALOG_Z_INDEX,
    }}
    PaperProps={{
      style: {
        backgroundColor: DARK_BLUE,
        padding: 0,
        color: 'rgba(255,255,255,0.9)',
        overflowY: 'auto',
        maxWidth: 920,
        // Prevent width from animating.
        transition: 'transform 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
      },
    }}
    {...props}
  />
);

export const OverlayDiv = ({
  overlay,
  closeOverlay,
  isUserLoggedIn,
  selectExploreProject,
  viewProjectList,
  activeProject,
}) => {
  const scrollToTop = () => {
    document.getElementById('overlay-wrapper').scrollTop = 0;
  };

  const components = {
    [LANDING]: () => <LandingPage isUserLoggedIn={isUserLoggedIn} transition />,
    [VIEW_PROJECTS]: () => (
      // Opens the LandingPage, but snaps to the 'View Projects' section
      <LandingPage isUserLoggedIn={isUserLoggedIn} isViewingProjects transition />
    ),
    [PROJECT_LANDING]: () => (
      <ProjectLandingPage
        selectExplore={selectExploreProject}
        viewProjects={viewProjectList}
        project={activeProject}
        closeOverlay={closeOverlay}
        scrollToTop={scrollToTop}
      />
    ),
    [DISASTER]: Disaster,
    [REQUEST_PROJECT_ACCESS]: RequestProjectAccessDialog,
  };
  const OverlayComponent = components[overlay];

  return (
    <Dialog open={!!overlay} onClose={closeOverlay} fullScreen={isMobile()} fullWidth={isMobile()}>
      <Wrapper id="overlay-wrapper">
        <CloseIcon onClick={closeOverlay} />
        {overlay && <OverlayComponent />}
      </Wrapper>
    </Dialog>
  );
};

OverlayDiv.propTypes = {
  overlay: PropTypes.node,
  closeOverlay: PropTypes.func.isRequired,
  viewProjectList: PropTypes.func.isRequired,
  activeProject: PropTypes.shape({}),
  selectExploreProject: PropTypes.func.isRequired,
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
  viewProjectList: () => dispatch(setOverlayComponent(LANDING)),
  closeOverlay: () => {
    dispatch(setOverlayComponent(null));
  },
});

export default connect(mapStateToProps, null, mergeProps)(OverlayDiv);
