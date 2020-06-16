/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { LocationOn, SpeakerNotes, List } from '@material-ui/icons';
import { CardTabs, CardTabList, CardTab, CardTabPanels, CardTabPanel } from '@tupaia/ui-components';
import { checkAlertsPanelIsOpen, closeAlertsPanel } from '../../store';
import {
  Drawer,
  DrawerHeader,
  DrawerHeaderContent,
  AffectedSitesTab,
  ActivityTab,
  NotesTab,
} from '../../components';
import { countryFlagImage } from '../../utils';

export const AlertsPanelComponent = ({ isOpen, handleClose }) => {
  return (
    <Drawer open={isOpen} onClose={handleClose}>
      <DrawerHeader heading="Upcoming report" onClose={handleClose}>
        <DrawerHeaderContent
          heading="Acute Fever and Rash (AFR)"
          date="Week 9 Feb 25 - Mar 1, 2021"
          avatarUrl={countryFlagImage('as')}
        />
      </DrawerHeader>
      <CardTabs>
        <CardTabList>
          <CardTab>
            <LocationOn /> Affected Sites
          </CardTab>
          <CardTab>
            <SpeakerNotes />
            Notes (3)
          </CardTab>
          <CardTab>
            <List />
            Activity
          </CardTab>
        </CardTabList>
        <CardTabPanels>
          <CardTabPanel>
            <AffectedSitesTab />
          </CardTabPanel>
          <CardTabPanel>
            <NotesTab />
          </CardTabPanel>
          <CardTabPanel>
            <ActivityTab />
          </CardTabPanel>
        </CardTabPanels>
      </CardTabs>
    </Drawer>
  );
};

AlertsPanelComponent.propTypes = {
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

const mapStateToProps = state => ({
  isOpen: checkAlertsPanelIsOpen(state),
});

const mapDispatchToProps = dispatch => ({
  handleClose: () => dispatch(closeAlertsPanel()),
});

export const AlertsPanel = connect(mapStateToProps, mapDispatchToProps)(AlertsPanelComponent);
