/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, CheckboxList, ListItemProps } from '@tupaia/ui-components';
import { DashboardItem } from '../../../types';
import { Typography } from '@material-ui/core';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width 100%;
`;

const PrimaryContext = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width 100%;
  align-items: start;
`;

const ButtonGroup = styled.div`
  padding-top: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const Instructions = styled(Typography)`
  color: ${props => props.theme.palette.text.primary};
  font-size: 1rem;
`;

const CheckboxListContainer = styled.div`
  padding-top: 1.5rem;
  width: 100%;
`;

interface ExportDashboardProps {
  onNext: () => void;
  onClose: () => void;
  dashboardItems: DashboardItem[];
  setSelectedDashboardItems: (items: string[]) => void;
}

interface ListItem extends ListItemProps {
  code: string;
}

export const SelectVisualisation = ({
  onNext,
  onClose,
  dashboardItems = [],
  setSelectedDashboardItems,
}: ExportDashboardProps) => {
  const [selectedItems, setSelectedItems] = useState<ListItem[]>([]);

  const list = dashboardItems.map(({ config, code }) => ({
    name: config?.name,
    code,
    disabled: config?.type !== 'chart',
    tooltip: config?.type !== 'chart' ? 'PDF export coming soon' : undefined,
  }));

  const onChange = (newItems: ListItem[]) => {
    setSelectedItems(newItems);
    setSelectedDashboardItems(newItems.map(({ code }) => code));
  };

  return (
    <Container>
      <PrimaryContext>
        <Instructions>
          Select the visualisations you would like to export and click 'Next'.
        </Instructions>
        <CheckboxListContainer>
          <CheckboxList
            title="Select Visualisations"
            list={list}
            selectedItems={selectedItems}
            setSelectedItems={onChange}
          />
        </CheckboxListContainer>
      </PrimaryContext>
      <ButtonGroup>
        <Button variant="outlined" color="default" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onNext}
          disabled={selectedItems.length === 0}
        >
          Next
        </Button>
      </ButtonGroup>
    </Container>
  );
};
