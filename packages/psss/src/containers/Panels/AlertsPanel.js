/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { MoveToInbox, LocationOn, SpeakerNotes, List } from '@material-ui/icons';
import {
  CardTabList,
  CardTab,
  CardTabPanels,
  WarningCloud,
  Virus,
  LinkButton,
} from '@tupaia/ui-components';
import { getAffectedSites, getAlertsMessages, getActivityFeed } from '../../api';
import {
  Drawer,
  DropdownMenu,
  AlertsDrawerHeader,
  AffectedSitesTab,
  ActivityTab,
  DrawerTray,
} from '../../components';
import { CreateOutbreakModal } from '../Modals';
import { NotesTab } from '../NotesTab';
import { countryFlagImage, getCountryName } from '../../utils';
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

const TabsContext = React.createContext(null);

export const AlertsPanel = React.memo(({ isOpen, handleClose }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const sitesState = useFetch(getAffectedSites);
  const notesState = useFetch(getAlertsMessages);
  const activityState = useFetch(getActivityFeed);
  const { countryCode } = useParams();

  const handleChange = option => {
    // todo handle changes other than creating an outbreak
    setIsModalOpen(true);
  };

  return (
    <Drawer open={isOpen} onClose={handleClose}>
      <DrawerTray heading="Alert Details" onClose={handleClose} Icon={WarningCloud} />
      <AlertsDrawerHeader
        date="Week 9 Feb 25 - Mar 1, 2021"
        dateText="Triggered on:"
        avatarUrl={countryFlagImage('as')}
        subheading={getCountryName(countryCode)}
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
          <ActivityTab
            state={activityState}
            NotesTabLink={<LinkButton onClick={() => setActiveIndex(1)}>note</LinkButton>}
          />
        </CardTabPanels>
      </TabsContext.Provider>
      <CreateOutbreakModal isOpen={isModalOpen} handleClose={() => setIsModalOpen(false)} />
    </Drawer>
  );
});

AlertsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
