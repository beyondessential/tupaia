/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { PropTypes } from 'prop-types';
import { StyleRoot } from 'radium';
import { connect } from 'react-redux';
import { EnvBanner } from '@tupaia/ui-components';
import styled from 'styled-components';

import HeaderBar from '../../../containers/mobile/HeaderBar';
import { LoadingScreen } from '../../LoadingScreen';
import Footer from '../../../components/mobile/Footer';
import OverlayDiv from '../../../containers/OverlayDiv';
import { selectCurrentOrgUnit, selectIsEnlargedDialogVisible } from '../../../selectors';
import { EnlargedDialog } from '../../../containers/EnlargedDialog';
import { SearchBar } from '../../../containers/mobile/SearchBar';
import { Dashboard } from '../../../containers/mobile/Dashboard';

const EntityName = styled.p`
  text-align: center;
  font-size: 14pt;
  font-weight: bold;
  color: white;
`;

const RootScreen = ({ orgUnit, isLoading, isUserLoggedIn, enlargedDialogIsVisible }) => (
  <StyleRoot>
    <EnvBanner />
    <LoadingScreen isLoading={isLoading} />
    <div>
      <HeaderBar />
      <EntityName>{orgUnit.name}</EntityName>
      <SearchBar />
      <Dashboard />
      {enlargedDialogIsVisible ? <EnlargedDialog /> : null}
      <Footer />
      {isUserLoggedIn && <OverlayDiv />}
    </div>
  </StyleRoot>
);

RootScreen.propTypes = {
  orgUnit: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  isLoading: PropTypes.bool.isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
  enlargedDialogIsVisible: PropTypes.bool,
};

RootScreen.defaultProps = {
  enlargedDialogIsVisible: false,
};

const mapStateToProps = state => {
  return {
    orgUnit: selectCurrentOrgUnit(state),
    isLoading: state.global.isLoadingOrganisationUnit,
    isUserLoggedIn: state.authentication.isUserLoggedIn,
    enlargedDialogIsVisible: !!selectIsEnlargedDialogVisible(state),
  };
};

export default connect(mapStateToProps)(RootScreen);
