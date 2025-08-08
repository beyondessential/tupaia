import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { LocationOn, SpeakerNotes, List, MoveToInbox } from '@material-ui/icons';
import { CardTabList, CardTab, CardTabPanels, Virus, LinkButton } from '@tupaia/ui-components';
import { useParams } from 'react-router-dom';
import {
  Drawer,
  AlertsDrawerHeader,
  AffectedSitesTab,
  ActivityTab,
  DrawerTray,
  DropdownMenu,
} from '../../components';
import { NotesTab } from '../NotesTab';
import * as COLORS from '../../constants/colors';
import { getCountryName } from '../../store';
import { countryFlagImage } from '../../utils';
import { getAffectedSites, getAlertsMessages, getActivityFeed } from '../../api';
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
    value: 'Outbreak',
    label: (
      <Option>
        <Virus /> Outbreak
      </Option>
    ),
  },
  {
    value: 'Archive',
    label: (
      <Option>
        <MoveToInbox /> End and Archive
      </Option>
    ),
  },
];

const TabsContext = React.createContext(null);

export const OutbreaksPanel = ({ isOpen, handleClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sitesState = useFetch(getAffectedSites);
  const notesState = useFetch(getAlertsMessages);
  const activityState = useFetch(getActivityFeed);
  const { countryCode } = useParams();
  const countryName = useSelector(state => getCountryName(state, countryCode));

  const handleChange = option => {
    console.log('handle change...', option);
  };

  return (
    <div>
      <Drawer open={isOpen} onClose={handleClose}>
        <DrawerTray
          color={COLORS.RED}
          heading="Outbreak Details"
          onClose={handleClose}
          Icon={Virus}
        />
        <AlertsDrawerHeader
          color={COLORS.RED}
          dateText="Outbreak Start Date:"
          date="Mar 6, 2020"
          avatarUrl={countryFlagImage('as')}
          subheading={countryName}
          heading="Measles"
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
            <AffectedSitesTab type="outbreaks" state={sitesState} />
            <NotesTab state={notesState} />
            <ActivityTab
              state={activityState}
              NotesTabLink={<LinkButton onClick={() => setActiveIndex(1)}>note</LinkButton>}
            />
          </CardTabPanels>
        </TabsContext.Provider>
      </Drawer>
    </div>
  );
};

OutbreaksPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
