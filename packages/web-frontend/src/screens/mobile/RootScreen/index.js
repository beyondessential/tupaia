/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useRef, useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { StyleRoot } from 'radium';
import { connect } from 'react-redux';
import { EnvBanner } from '@tupaia/ui-components';
import styled from 'styled-components';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import HeaderBar from '../../../containers/mobile/HeaderBar';
import { LoadingScreen } from '../../LoadingScreen';
import Footer from '../../../components/mobile/Footer';
import OverlayDiv from '../../../containers/OverlayDiv';
import { Map } from '../../../containers/Map';
import {
  selectCurrentOrgUnit,
  selectIsEnlargedDialogVisible,
  selectMobileTab,
} from '../../../selectors';
import { EnlargedDialog } from '../../../containers/EnlargedDialog';
import { TUPAIA_ORANGE } from '../../../styles';
import { SearchBar } from '../../../containers/mobile/SearchBar';
import { Dashboard } from '../../../containers/mobile/Dashboard';
import { setMobileTab } from '../../../actions';

const Container = styled.div`
  width: 100%;
  z-index: 401;
  background: black;
`;

const MapContainer = styled.div`
  height: calc(100vh - ${p => p.$topOffset}px);
`;

const EntityName = styled.p`
  text-align: center;
  font-size: 14pt;
  font-weight: bold;
  color: white;
`;

const StyledTabs = styled(Tabs)`
  .MuiTabs-scroller.MuiTabs-indicator {
    display: none;
  }
`;

const StyledTab = styled(Tab)`
  flex: 1;
  color: white;
  background-color: ${({ selected }) => (selected ? TUPAIA_ORANGE : 'transparent')};
  border: ${({ selected }) => (selected ? 'none' : `1px ${TUPAIA_ORANGE} solid`)};
  text-transform: none;
  opacity: 1;
  max-width: none;
`;

const RootScreen = ({
  orgUnit,
  isLoading,
  isUserLoggedIn,
  enlargedDialogIsVisible,
  selectedTab,
  setSelectedTab,
}) => {
  const handleChangeSelectedTab = (event, newValue) => setSelectedTab(newValue);

  // maintain the main container height in state, so the map can sit below it
  const containerRef = useRef();
  const [containerHeight, setContainerHeight] = useState();
  const updateContainerHeight = () => {
    setContainerHeight(containerRef.current.clientHeight);
  };
  useEffect(() => {
    updateContainerHeight(); // set once on mount
  });

  return (
    <StyleRoot>
      <EnvBanner />
      <LoadingScreen isLoading={isLoading} />
      <div>
        <Container ref={containerRef}>
          <HeaderBar />
          <EntityName>{orgUnit.name}</EntityName>
          <StyledTabs
            value={selectedTab}
            onChange={handleChangeSelectedTab}
            TabIndicatorProps={{
              style: { display: 'none' },
            }}
          >
            <StyledTab label="Dashboard" value="dashboard" disableRipple />
            <StyledTab label="Map" value="map" disableRipple />
          </StyledTabs>
          <SearchBar />
        </Container>
        {selectedTab === 'dashboard' && <Dashboard />}
        {selectedTab === 'map' && containerHeight && (
          <MapContainer $topOffset={containerHeight}>
            <Map showZoomControl={false} />
          </MapContainer>
        )}
        {enlargedDialogIsVisible ? <EnlargedDialog /> : null}
        {selectedTab === 'dashboard' && <Footer />}
      </div>
      {isUserLoggedIn && <OverlayDiv />}
    </StyleRoot>
  );
};

RootScreen.propTypes = {
  orgUnit: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
  enlargedDialogIsVisible: PropTypes.bool,
  selectedTab: PropTypes.oneOf(['dashboard', 'map']),
  setSelectedTab: PropTypes.func.isRequired,
};

RootScreen.defaultProps = {
  enlargedDialogIsVisible: false,
  selectedTab: 'dashboard',
};

const mapStateToProps = state => ({
  orgUnit: selectCurrentOrgUnit(state),
  isLoading: state.global.isLoadingOrganisationUnit,
  isUserLoggedIn: state.authentication.isUserLoggedIn,
  enlargedDialogIsVisible: !!selectIsEnlargedDialogVisible(state),
  selectedTab: selectMobileTab(state),
});

const mapDispatchToProps = dispatch => ({
  setSelectedTab: tab => dispatch(setMobileTab(tab)),
});

export default connect(mapStateToProps, mapDispatchToProps)(RootScreen);
