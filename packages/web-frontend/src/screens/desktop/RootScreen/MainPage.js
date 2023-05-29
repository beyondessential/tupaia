import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { EnvBanner } from '@tupaia/ui-components';
import { selectIsEnlargedDialogVisible } from '../../../selectors';
import { LoadingScreen } from '../../LoadingScreen';
import { Map } from '../../../containers/Map';
import { MapDiv } from '../../../components/MapDiv';
import TopBar from '../../../containers/TopBar';
import SidePanel from '../../../containers/SidePanel';
import { EnlargedDialog } from '../../../containers/EnlargedDialog';
import SessionExpiredDialog from '../../../containers/SessionExpiredDialog';
import OverlayDiv from '../../../containers/OverlayDiv';
import { DIALOG_Z_INDEX } from '../../../styles';

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
  overflow-y: hidden;
  height: 100%;

  svg.recharts-surface {
    overflow: visible;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  overflow: hidden;
`;

const MapContainer = styled.div`
  height: 100vh;
  width: calc(100vw - ${p => p.$rightOffset}px);
  transition: width 0.5s ease;
`;

const MainPage = ({ enlargedDialogIsVisible, isLoading, sidePanelWidth }) => (
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
    <MapContainer $rightOffset={sidePanelWidth}>
      <Map />
    </MapContainer>
  </>
);

MainPage.propTypes = {
  enlargedDialogIsVisible: PropTypes.bool,
  isLoading: PropTypes.bool,
  sidePanelWidth: PropTypes.number.isRequired,
};

MainPage.defaultProps = {
  enlargedDialogIsVisible: false,
  isLoading: false,
};

const mapStateToProps = state => {
  const { isSidePanelExpanded } = state.global;
  const { contractedWidth, expandedWidth } = state.dashboard;

  return {
    enlargedDialogIsVisible: !!selectIsEnlargedDialogVisible(state),
    isLoading: state.global.isLoadingOrganisationUnit,
    sidePanelWidth: isSidePanelExpanded ? expandedWidth : contractedWidth,
  };
};

export default connect(mapStateToProps)(MainPage);
