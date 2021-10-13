/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { PropTypes } from 'prop-types';
import React, { Component } from 'react';
import { StyleRoot } from 'radium';
import { connect } from 'react-redux';
import { EnvBanner } from '@tupaia/ui-components';

import HeaderBar from '../../../containers/mobile/HeaderBar';
import { ExportDialog } from '../../../components/ExportDialog';
import HomeScreen from '../HomeScreen';
import RegionScreen from '../RegionScreen';
import FacilityScreen from '../FacilityScreen';
import { LoadingScreen } from '../../LoadingScreen';
import Footer from '../../../components/mobile/Footer';
import { ENTITY_TYPE } from '../../../constants';
import OverlayDiv from '../../../containers/OverlayDiv';
import { selectCurrentOrgUnit, selectIsEnlargedDialogVisible } from '../../../selectors';
import { EnlargedDialog } from '../../../containers/EnlargedDialog';

const ORG_UNIT_TYPE_TO_COMPONENT = {
  [ENTITY_TYPE.COUNTRY]: RegionScreen,
  [ENTITY_TYPE.DISTRICT]: RegionScreen,
  [ENTITY_TYPE.SUB_DISTRICT]: RegionScreen,
  [ENTITY_TYPE.FACILITY]: FacilityScreen,
  [ENTITY_TYPE.VILLAGE]: RegionScreen,
};

const getPageComponent = orgUnitType => ORG_UNIT_TYPE_TO_COMPONENT[orgUnitType] || HomeScreen;

class RootScreen extends Component {
  renderPage() {
    const { currentOrganisationUnitType } = this.props;
    const PageComponent = getPageComponent(currentOrganisationUnitType);
    return <PageComponent />;
  }

  render() {
    const { isLoading, isUserLoggedIn, enlargedDialogIsVisible } = this.props;

    return (
      <StyleRoot>
        <EnvBanner />
        <LoadingScreen isLoading={isLoading} />
        <div>
          <HeaderBar />
          {this.renderPage()}
          {enlargedDialogIsVisible ? <EnlargedDialog /> : null}
          <ExportDialog />
          <Footer />
          {isUserLoggedIn && <OverlayDiv />}
          {/* <EnlargedDialog /> */}
          <ExportDialog />
        </div>
      </StyleRoot>
    );
  }
}

RootScreen.propTypes = {
  currentOrganisationUnitType: PropTypes.string.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
  enlargedDialogIsVisible: PropTypes.bool,
};

RootScreen.defaultProps = {
  enlargedDialogIsVisible: false,
};

const mapStateToProps = state => {
  return {
    currentOrganisationUnitType: selectCurrentOrgUnit(state).type,
    isLoading: state.global.isLoadingOrganisationUnit,
    isUserLoggedIn: state.authentication.isUserLoggedIn,
    enlargedDialogIsVisible: !!selectIsEnlargedDialogVisible(state),
  };
};

export default connect(mapStateToProps)(RootScreen);
