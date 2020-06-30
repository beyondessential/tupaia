/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MuiLink from '@material-ui/core/Link';
import { MoveToInbox, LocationOn, SpeakerNotes, List } from '@material-ui/icons';
import { CardTabList, CardTab, CardTabPanels, WarningCloud, Virus } from '@tupaia/ui-components';
import { connectApi } from '../../api';
import {
  Drawer,
  DropdownMenu,
  AlertsDrawerHeader,
  AffectedSitesTab,
  ActivityTab,
  NotesTab,
  DrawerTray,
} from '../../components';
import { countryFlagImage } from '../../utils';
import { useFetch } from '../../hooks';

const Option = styled.span`
  display: flex;
  align-items: center;

  svg {
    margin-right: 0.5rem;
  }
`;

const menuOptions = [
  {
    value: 'Alert',
    label: (
      <Option>
        <WarningCloud /> Alert
      </Option>
    ),
  },
  {
    value: 'Archive',
    label: (
      <Option>
        <MoveToInbox /> Archive Alert
      </Option>
    ),
  },
  {
    value: 'Outbreak',
    label: (
      <Option>
        <Virus /> Create Outbreak
      </Option>
    ),
  },
];

const StyledLink = styled(MuiLink)`
  text-decoration: underline;
  font-size: 1rem;
  line-height: 1.2rem;
`;

const TabsContext = React.createContext(null);

export const AlertsPanelComponent = React.memo(
  ({ isOpen, handleClose, fetchSitesData, fetchNotesData, fetchActivityData }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const sitesState = useFetch(fetchSitesData);
    const notesState = useFetch(fetchNotesData);
    const activityState = useFetch(fetchActivityData);

    const handleChange = option => {
      console.log('handle change...', option);
    };

    const NotesTabLink = ({ children }) => (
      <StyledLink component="button" onClick={() => setActiveIndex(1)}>
        {children}
      </StyledLink>
    );

    NotesTabLink.propTypes = {
      children: PropTypes.any.isRequired,
    };

    return (
      <Drawer open={isOpen} onClose={handleClose}>
        <DrawerTray heading="Alert Details" onClose={handleClose} Icon={WarningCloud} />
        <AlertsDrawerHeader
          date="Week 9 Feb 25 - Mar 1, 2021"
          dateText="Triggered on:"
          avatarUrl={countryFlagImage('as')}
          subheading="American Samoa"
          heading="Acute Fever and Rash (AFR)"
          DropdownMenu={<DropdownMenu options={menuOptions} onChange={handleChange} />}
        />
        <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
          <CardTabList Context={TabsContext}>
            <CardTab>
              <LocationOn /> Affected Sites
            </CardTab>
            <CardTab>
              <SpeakerNotes />
              Notes ({notesState.count})
            </CardTab>
            <CardTab>
              <List />
              Activity
            </CardTab>
          </CardTabList>
          <CardTabPanels Context={TabsContext}>
            <AffectedSitesTab state={sitesState} />
            <NotesTab state={notesState} />
            <ActivityTab state={activityState} NotesTabLink={NotesTabLink} />
          </CardTabPanels>
        </TabsContext.Provider>
      </Drawer>
    );
  },
);

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
