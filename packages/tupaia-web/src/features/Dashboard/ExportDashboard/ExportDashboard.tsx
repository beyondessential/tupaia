/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { DashboardItem } from '../../../types';
import { Modal } from '../../../components';
import { SelectVisualisation } from './SelectVisualisations';
import { Preview } from './Preview';

const Wrapper = styled.div`
  width: 56rem;
  max-width: 100%;
  padding: 2.5rem 1.875rem 0rem 1.875rem;
  display: flex;
  justify-content: center;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-basis: 83.3333%;
  button {
    text-transform: none;
  }
  .loading-screen {
    background-color: ${props => props.theme.palette.background.default};
    border: 0;
    button {
      padding: 0.5em 1.75em;
      font-size: 1rem;
    }
  }
`;

interface ExportDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardItems: DashboardItem[];
}

const SELECT_VISUALISATIONS_SCREEN = 'SELECT_VISUALISATIONS';
const PREVIEW_SCREEN = 'PREVIEW';

export const ExportDashboard = ({ isOpen, onClose, dashboardItems = [] }: ExportDashboardProps) => {
  const [selectedDashboardItems, setSelectedDashboardItems] = useState<string[]>([]);
  const [screen, setScreen] = useState(SELECT_VISUALISATIONS_SCREEN);
  const onNext = () => setScreen(PREVIEW_SCREEN);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Wrapper>
        <Container>
          {screen === SELECT_VISUALISATIONS_SCREEN ? (
            <SelectVisualisation
              onNext={onNext}
              onClose={onClose}
              dashboardItems={dashboardItems}
              setSelectedDashboardItems={setSelectedDashboardItems}
            />
          ) : (
            <Preview onClose={onClose} selectedDashboardItems={selectedDashboardItems} />
          )}
        </Container>
      </Wrapper>
    </Modal>
  );
};
