/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React, { Component } from 'react';
import { StyleRoot } from 'radium';
import { connect } from 'react-redux';

import HeaderBar from '../../../containers/mobile/HeaderBar';
import { EnlargedDialog } from '../../../containers/EnlargedDialog';
import ExportDialog from '../../../containers/ExportDialog';
import HomeScreen from '../HomeScreen';
import RegionScreen from '../RegionScreen';
import FacilityScreen from '../FacilityScreen';
import { LoadingScreen } from '../LoadingScreen';
import Footer from '../../../components/mobile/Footer';
import OverlayDiv from '../../../containers/OverlayDiv';

class RootScreen extends Component {
  renderPage() {
    const { currentOrganisationUnit } = this.props;

    switch (currentOrganisationUnit.type) {
      case 'Region':
      case 'Province':
      case 'Country':
        return <RegionScreen />;

      case 'Facility':
        return <FacilityScreen />;

      default:
        return <HomeScreen />;
    }
  }

  render() {
    const { isLoading, isUserLoggedIn } = this.props;

    return (
      <StyleRoot>
        <LoadingScreen isLoading={isLoading} />
        <div>
          <HeaderBar />
          {this.renderPage()}
          <EnlargedDialog />
          <ExportDialog />
          <Footer />
          {isUserLoggedIn && <OverlayDiv />}
          <EnlargedDialog />
          <ExportDialog />
        </div>
      </StyleRoot>
    );
  }
}

const mapStateToProps = state => ({
  currentOrganisationUnit: state.global.currentOrganisationUnit,
  isLoading: !!state.global.loadingOrganisationUnit,
  isUserLoggedIn: state.authentication.isUserLoggedIn,
});

export default connect(mapStateToProps)(RootScreen);
