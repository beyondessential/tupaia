/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

/**
 * RootScreen
 *
 * Bare bones container that renders the map fixed in the background and controls vertical ratios
 * of Dashboard and MapDiv based on expanded state of Dashboard (through redux store)
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { EnvBanner } from '@tupaia/ui-components';
import { selectIsEnlargedDialogVisible } from '../../../selectors';
import { LoadingScreen } from '../../LoadingScreen';
import Map from '../../../containers/Map';
import { MapDiv } from '../../../components/MapDiv';
import TopBar from '../../../containers/TopBar';
import SidePanel from '../../../containers/SidePanel';
import { EnlargedDialog } from '../../../containers/EnlargedDialog';
import SessionExpiredDialog from '../../../containers/SessionExpiredDialog';
import OverlayDiv from '../../../containers/OverlayDiv';
import { DIALOG_Z_INDEX } from '../../../styles';
import './desktop-styles.css';

const Container = styled.div`
  position: fixed;
  z-index: ${DIALOG_Z_INDEX};
  flex-direction: column;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  pointer-events: visiblePainted; /* IE 9-10 doesn't have auto */
  pointer-events: none;
  display: flex; /* Took me ages to find this, is the magic touch */
  align-items: stretch;
  align-content: stretch;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
`;

export const RootScreen = ({ enlargedDialogIsVisible, isLoading }) => {
  return (
    <>
      {/* The order here matters, Map must be added to the DOM body after FlexContainer */}
      <Container>
        <EnvBanner />
        <TopBar />
        <ContentContainer>
          <MapDiv />
          <SidePanel />
        </ContentContainer>
        <OverlayDiv />
        <SessionExpiredDialog />
        {enlargedDialogIsVisible ? <EnlargedDialog /> : null}
        <LoadingScreen isLoading={isLoading} />
      </Container>
      <Map />
    </>
  );
};

RootScreen.propTypes = {
  enlargedDialogIsVisible: PropTypes.bool,
  isLoading: PropTypes.bool,
};

RootScreen.defaultProps = {
  enlargedDialogIsVisible: false,
  isLoading: false,
};

const mapStateToProps = state => ({
  enlargedDialogIsVisible: !!selectIsEnlargedDialogVisible(state),
  isLoading: state.global.isLoadingOrganisationUnit,
});

export default connect(mapStateToProps)(RootScreen);
