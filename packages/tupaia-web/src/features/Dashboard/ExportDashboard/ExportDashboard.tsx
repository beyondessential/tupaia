/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { DashboardItem } from '../../../types';
import { Modal as BaseModal } from '../../../components';
import { SelectVisualisation } from './SelectVisualisations';
import { ExportSettings } from './ExportSettings';

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
    padding: 2.5rem 2.875rem 0rem 2.875rem;
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
  .loading-screen {
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
  font-size: 1.2rem;
  line-height: 1.4;
`;

interface ExportDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardItems: DashboardItem[];
}

const SELECT_VISUALISATIONS_SCREEN = 'SELECT_VISUALISATIONS';
const EXPORT_SETTINGS_SCREEN = 'EXPORT_SETTINGS';

export const ExportDashboard = ({ isOpen, onClose, dashboardItems = [] }: ExportDashboardProps) => {
  const [selectedDashboardItems, setSelectedDashboardItems] = useState<string[]>([]);
  const [screen, setScreen] = useState(SELECT_VISUALISATIONS_SCREEN);
  const onNext = () => setScreen(EXPORT_SETTINGS_SCREEN);
  const onCloseModal = () => {
    onClose();
    setScreen(SELECT_VISUALISATIONS_SCREEN);
    setSelectedDashboardItems([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={onCloseModal}>
      <Wrapper>
        <Title>Export dashboard</Title>
        <Container>
          {screen === SELECT_VISUALISATIONS_SCREEN ? (
            <SelectVisualisation
              onNext={onNext}
              onClose={onCloseModal}
              dashboardItems={dashboardItems}
              setSelectedDashboardItems={setSelectedDashboardItems}
            />
          ) : (
            <ExportSettings
              onClose={onCloseModal}
              selectedDashboardItems={selectedDashboardItems}
            />
          )}
        </Container>
      </Wrapper>
    </Modal>
  );
};
