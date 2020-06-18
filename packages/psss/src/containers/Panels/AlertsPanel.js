/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { LocationOn, SpeakerNotes, List } from '@material-ui/icons';
import { CardTabs, CardTabList, CardTab, CardTabPanels, WarningCloud } from '@tupaia/ui-components';
import {
  Drawer,
  AlertsDrawerHeader,
  AffectedSitesTab,
  ActivityTab,
  NotesTab,
  DrawerTray,
} from '../../components';
import { countryFlagImage } from '../../utils';

export const AlertsPanel = ({ isOpen, handleClose }) => {
  return (
    <Drawer open={isOpen} onClose={handleClose}>
      <DrawerTray heading="Alert Details" onClose={handleClose} Icon={WarningCloud} />
      <AlertsDrawerHeader
        date="Week 9 Feb 25 - Mar 1, 2021"
        avatarUrl={countryFlagImage('as')}
        subheading="American Samoa"
        heading="Acute Fever and Rash (AFR)"
      />
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
          <AffectedSitesTab />
          <NotesTab />
          <ActivityTab />
        </CardTabPanels>
      </CardTabs>
    </Drawer>
  );
};

AlertsPanel.propTypes = {
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

