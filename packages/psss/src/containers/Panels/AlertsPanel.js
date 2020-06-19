/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { LocationOn, SpeakerNotes, List } from '@material-ui/icons';
import { CardTabs, CardTabList, CardTab, CardTabPanels, WarningCloud } from '@tupaia/ui-components';
import { connectApi } from '../../api';
import {
  Drawer,
  AlertsDrawerHeader,
  AffectedSitesTab,
  ActivityTab,
  NotesTab,
  DrawerTray,
} from '../../components';
import { countryFlagImage } from '../../utils';
import { useFetch } from '../../hooks';

export const AlertsPanelComponent = ({
  isOpen,
  handleClose,
  fetchSitesData,
  fetchNotesData,
  fetchActivityData,
}) => {
  const sitesState = useFetch(fetchSitesData);
  const notesState = useFetch(fetchNotesData);
  const activityState = useFetch(fetchActivityData);

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
          <AffectedSitesTab state={sitesState} />
          <NotesTab state={notesState} />
          <ActivityTab state={activityState} />
        </CardTabPanels>
      </CardTabs>
    </Drawer>
  );
};

AlertsPanelComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  fetchSitesData: PropTypes.func.isRequired,
  fetchNotesData: PropTypes.func.isRequired,
  fetchActivityData: PropTypes.func.isRequired,
};

const mapApiToProps = api => ({
  fetchSitesData: () => api.get('affected-sites'),
  fetchNotesData: () => api.get('messages'),
  fetchActivityData: () => api.get('activity-feed'),
});

export const AlertsPanel = connectApi(mapApiToProps)(AlertsPanelComponent);
