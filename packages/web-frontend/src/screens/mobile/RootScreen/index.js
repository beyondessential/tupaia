/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { PropTypes } from 'prop-types';
import React, { Component } from 'react';
import { StyleRoot } from 'radium';
import { connect } from 'react-redux';

import HeaderBar from '../../../containers/mobile/HeaderBar';
import { ExportDialog } from '../../../components/ExportDialog';
import HomeScreen from '../HomeScreen';
import RegionScreen from '../RegionScreen';
import FacilityScreen from '../FacilityScreen';
import { LoadingScreen } from '../LoadingScreen';
import Footer from '../../../components/mobile/Footer';
import { ENTITY_TYPE } from '../../../constants';
import OverlayDiv from '../../../containers/OverlayDiv';
import { selectCurrentOrgUnit } from '../../../selectors';
import { EnlargedDialogWrapper } from '../../../containers/EnlargedDialog';

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
    const { isLoading, isUserLoggedIn } = this.props;

    return (
      <StyleRoot>
        <LoadingScreen isLoading={isLoading} />
        <div>
          <HeaderBar />
          {this.renderPage()}
          <EnlargedDialogWrapper />
          <ExportDialog />
          <Footer />
          {isUserLoggedIn && <OverlayDiv />}
          <EnlargedDialogWrapper />
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
};

RootScreen.defaultProps = {
  currentOrganisationUnitType: '',
};

const mapStateToProps = state => {
  return {
    currentOrganisationUnitType: selectCurrentOrgUnit(state).type,
    isLoading: state.global.isLoadingOrganisationUnit,
    isUserLoggedIn: state.authentication.isUserLoggedIn,
  };
};

export default connect(mapStateToProps)(RootScreen);
