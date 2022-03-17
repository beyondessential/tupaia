/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { PropTypes } from 'prop-types';
import { StyleRoot } from 'radium';
import { connect } from 'react-redux';
import { EnvBanner } from '@tupaia/ui-components';
import styled from 'styled-components';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import './mobile-styles.css';

import HeaderBar from '../../../containers/mobile/HeaderBar';
import { LoadingScreen } from '../../LoadingScreen';
import Footer from '../../../components/mobile/Footer';
import OverlayDiv from '../../../containers/OverlayDiv';
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
import { MapSection } from '../../../containers/mobile/MapSection';

const RootContainer = styled(StyleRoot)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: black;
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
  const handleChangeSelectedTab = useCallback((event, newValue) => setSelectedTab(newValue), [
    setSelectedTab,
  ]);

  // maintain the header height in state, so the overlay div can fill (but not overfill!) the screen
  // below it
  const headerRef = useRef();
  const [headerHeight, setHeaderHeight] = useState(0);
  const updateHeaderHeight = () => {
    setHeaderHeight(headerRef.current.clientHeight);
  };
  useEffect(() => {
    updateHeaderHeight();
  });

  return (
    <RootContainer>
      <EnvBanner />
      <LoadingScreen isLoading={isLoading} />
      <div ref={headerRef}>
        <HeaderBar />
      </div>
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
      {selectedTab === 'dashboard' && <Dashboard />}
      {selectedTab === 'map' && <MapSection appHeaderHeight={headerHeight} />}
      {enlargedDialogIsVisible ? <EnlargedDialog /> : null}
      {selectedTab === 'dashboard' && <Footer />}
      {isUserLoggedIn && <OverlayDiv />}
    </RootContainer>
  );
};

RootScreen.propTypes = {
  orgUnit: PropTypes.shape({
    name: PropTypes.string,
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
