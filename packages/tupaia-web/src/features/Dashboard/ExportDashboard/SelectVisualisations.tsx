/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, CheckboxList, ListItemProps } from '@tupaia/ui-components';
import { DashboardItem } from '../../../types';

const ButtonGroup = styled.div`
  padding-top: 2.5rem;
  width: 100%;
  display: flex;
  justify-content: flex-end;
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
    <>
      <CheckboxList
        title="Select Visualisations"
        list={list}
        selectedItems={selectedItems}
        setSelectedItems={onChange}
      />
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
    </>
  );
};
