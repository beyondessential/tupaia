import PropTypes from 'prop-types';
import React, { createContext, useCallback, useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { MoveToInbox, LocationOn, SpeakerNotes, List } from '@material-ui/icons';
import {
  CardTabList,
  CardTab,
  CardTabPanels,
  WarningCloud,
  LinkButton,
} from '@tupaia/ui-components';
import { getAlertsMessages, getActivityFeed } from '../../api';
import {
  Drawer,
  DropdownMenu,
  AlertsDrawerHeader,
  AffectedSitesTab,
  ActivityTab,
  DrawerTray,
} from '../../components';
import { CreateOutbreakModal, ArchiveAlertModal } from '../Modals';
import { NotesTab } from '../NotesTab';
import { getCountryName } from '../../store';
import { countryFlagImage, getDisplayDatesByPeriod, getWeekNumberByPeriod } from '../../utils';
import { useFetch } from '../../hooks';
import { AlertsPanelContext } from '../../context';

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
  // {
  //   value: 'Outbreak',
  //   label: (
  //     <Option>
  //       <Virus /> Create Outbreak
  //     </Option>
  //   ),
  // },
];

const TabsContext = createContext(null);

export const AlertsPanelProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({});

  return (
    <AlertsPanelContext.Provider value={{ data, setData, isOpen, setIsOpen }}>
      {children}
    </AlertsPanelContext.Provider>
  );
};

AlertsPanelProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const AlertsPanel = React.memo(() => {
  const { data: panelData, isOpen, setIsOpen } = useContext(AlertsPanelContext);
  const { id: alertId, organisationUnit: countryCode, period, syndrome, syndromeName } = panelData;
  const alert = { period, organisationUnit: countryCode, syndrome };
  const [isArchiveAlertModalOpen, setIsArchiveAlertModalOpen] = useState(false);
  const [isCreateOutbreakModalOpen, setIsCreateOutBreakModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const notesState = useFetch(getAlertsMessages);
  const activityState = useFetch(getActivityFeed);
  const countryName = useSelector(state => getCountryName(state, countryCode));

  const handleChange = option => {
    switch (option.value) {
      case 'Archive':
        setIsArchiveAlertModalOpen(true);
        break;
      case 'Outbreak':
        setIsCreateOutBreakModalOpen(true);
        break;
      default:
    }
  };

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const handleCloseCreateOutbreakModal = useCallback(() => {
    setIsCreateOutBreakModalOpen(false);
  }, [setIsCreateOutBreakModalOpen]);

  const handleCloseArchiveAlertModal = useCallback(() => {
    setIsArchiveAlertModalOpen(false);
  }, [setIsArchiveAlertModalOpen]);

  return (
    <Drawer open={isOpen} onClose={handleClose}>
      <DrawerTray heading="Alert Details" onClose={handleClose} Icon={WarningCloud} />
      {period && countryCode && (
        <AlertsDrawerHeader
          dateText={`Triggered on: W${getWeekNumberByPeriod(period)}`}
          date={getDisplayDatesByPeriod(period)}
          avatarUrl={countryFlagImage(countryCode)}
          subheading={countryName}
          heading={syndromeName}
          DropdownMenu={
            <DropdownMenu options={menuOptions} onChange={handleChange} readOnly="true" />
          }
        />
      )}
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
          <AffectedSitesTab alert={alert} />
          <NotesTab state={notesState} />
          <ActivityTab
            state={activityState}
            NotesTabLink={<LinkButton onClick={() => setActiveIndex(1)}>note</LinkButton>}
          />
        </CardTabPanels>
      </TabsContext.Provider>
      <CreateOutbreakModal
        isOpen={isCreateOutbreakModalOpen}
        onClose={handleCloseCreateOutbreakModal}
      />
      <ArchiveAlertModal
        isOpen={isArchiveAlertModalOpen}
        onClose={handleCloseArchiveAlertModal}
        alertId={alertId}
      />
    </Drawer>
  );
});
