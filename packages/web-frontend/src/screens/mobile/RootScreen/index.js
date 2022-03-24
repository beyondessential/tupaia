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
import Portal from '@material-ui/core/Portal';
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
import { MOBILE_BACKGROUND_COLOR, TUPAIA_ORANGE, LEAFLET_Z_INDEX } from '../../../styles';
import { SearchBar } from '../../../containers/mobile/SearchBar';
import { Dashboard } from '../../../containers/mobile/Dashboard';
import { setMobileTab } from '../../../actions';
import { MapSection } from '../../../containers/mobile/MapSection';

const RootContainer = styled(StyleRoot)`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${MOBILE_BACKGROUND_COLOR};
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

const ModalDiv = styled.div`
  ${p =>
    p.$isOpen
      ? `
        top: ${p.$appHeaderHeight}px;
        min-height: calc(
          100vh - ${p.$appHeaderHeight}px
        ); /* subtract header so modal doesn't overflow the screen/become unnecessarily scrollable */
        `
      : `
        top: 100vh;
        min-height: 0;
        height: 0;
        overflow: hidden;
        `}
  transition: top 0.2s ease;
  position: absolute;
  width: 100%;
  z-index: ${LEAFLET_Z_INDEX + 1};
  background: ${MOBILE_BACKGROUND_COLOR};
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalElement, setModalElement] = useState(null);
  const useModal = useCallback(
    () => [
      ({ children }) => modalElement && <Portal container={modalElement}>{children}</Portal>,
      setIsModalOpen,
    ],
    [modalElement],
  );

  // maintain the header height in state, so the modal div can fill the screen below it, but not
  // overfill and become scrollable
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
      {selectedTab === 'map' && <MapSection useModal={useModal} />}
      {enlargedDialogIsVisible ? <EnlargedDialog /> : null}
      {selectedTab === 'dashboard' && <Footer />}
      <ModalDiv ref={setModalElement} $appHeaderHeight={headerHeight} $isOpen={isModalOpen} />
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
