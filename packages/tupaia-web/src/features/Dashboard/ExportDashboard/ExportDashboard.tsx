import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';

import { LoadingScreen } from '@tupaia/ui-components';

import { Modal as BaseModal } from '../../../components';
import { useDashboardContext } from '../utils';
import { ExportFormats, ExportSettingsContextProvider } from '..';
import { SelectVisualisation } from './SelectVisualisations';
import { ExportConfig } from './ExportConfig';

const Modal = styled(BaseModal)`
  .MuiPaper-root {
    text-align: left;
  }
`;

const Wrapper = styled.div`
  width: 75rem;
  height: 45rem;
  max-width: 100%;
  padding: 2.5rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;

  ${({ theme }) => theme.breakpoints.up('sm')} {
    padding: 2.375rem 3.625rem 0rem 2.375rem;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-basis: 83.3333%;
  width: 100%;
  button {
    text-transform: none;
  }
  ${LoadingScreen} {
    background-color: ${({ theme }) => theme.palette.background.paper};
    border: 0;
    button {
      padding: 0.5em 1.75em;
      font-size: 1rem;
    }
  }
  .loading-container {
    width: 100%;
  }
`;

const Title = styled(Typography).attrs({
  variant: 'h1',
})`
  color: ${props => props.theme.palette.text.primary};
  font-weight: bold;
  font-size: 1.125rem;
  line-height: 1.4;
`;

const SELECT_VISUALISATIONS_SCREEN = 'SELECT_VISUALISATIONS';
const EXPORT_SETTINGS_SCREEN = 'EXPORT_SETTINGS';

export const ExportDashboard = () => {
  const [selectedDashboardItems, setSelectedDashboardItems] = useState<string[]>([]);
  const { exportModalOpen, toggleExportModal } = useDashboardContext();
  const [screen, setScreen] = useState(SELECT_VISUALISATIONS_SCREEN);
  const onNext = () => setScreen(EXPORT_SETTINGS_SCREEN);
  const onCloseModal = () => {
    toggleExportModal();
    setScreen(SELECT_VISUALISATIONS_SCREEN);
    setSelectedDashboardItems([]);
  };

  return (
    <Modal isOpen={exportModalOpen} onClose={onCloseModal}>
      <ExportSettingsContextProvider
        defaultSettings={{
          exportFormat: ExportFormats.PNG,
          exportWithLabels: false,
          exportWithTable: true,
          exportWithTableDisabled: false,
          exportDescription: '',
          separatePagePerItem: true,
        }}
      >
        <Wrapper>
          <Title>Export dashboard</Title>
          <Container>
            {screen === SELECT_VISUALISATIONS_SCREEN ? (
              <SelectVisualisation
                onNext={onNext}
                onClose={onCloseModal}
                selectedDashboardItems={selectedDashboardItems}
                setSelectedDashboardItems={setSelectedDashboardItems}
              />
            ) : (
              <ExportConfig
                onClose={onCloseModal}
                selectedDashboardItems={selectedDashboardItems}
              />
            )}
          </Container>
        </Wrapper>
      </ExportSettingsContextProvider>
    </Modal>
  );
};
