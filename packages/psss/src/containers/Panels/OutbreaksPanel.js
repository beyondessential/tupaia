/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { LocationOn, SpeakerNotes, List } from '@material-ui/icons';
import { CardTabs, CardTabList, CardTab, CardTabPanels, Virus } from '@tupaia/ui-components';
import {
  Drawer,
  AlertsDrawerHeader,
  AffectedSitesTab,
  ActivityTab,
  NotesTab,
  DrawerTray,
} from '../../components';
import { countryFlagImage } from '../../utils';

export const OutbreaksPanel = ({ isOpen, handleClose }) => {
  return (
    <Drawer open={isOpen} onClose={handleClose}>
      <DrawerTray heading="Outbreak Details" onClose={handleClose} Icon={Virus} />
      <AlertsDrawerHeader
        date="Mar 6, 2020"
        avatarUrl={countryFlagImage('as')}
        subheading="American Samoa"
        heading="Measles"
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

OutbreaksPanel.propTypes = {
  handleClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};
