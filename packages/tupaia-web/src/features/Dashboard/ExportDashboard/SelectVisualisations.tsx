import React from 'react';
import styled from 'styled-components';
import { Typography } from '@material-ui/core';
import { Button, CheckboxList, ListItemProps } from '@tupaia/ui-components';
import { DashboardItem } from '../../../types';
import { useDashboard } from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const PrimaryContext = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
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

interface SelectVisualisationsProps {
  onNext: () => void;
  onClose: () => void;
  selectedDashboardItems: string[];
  setSelectedDashboardItems: (newItems: string[]) => void;
}

interface ListItem extends ListItemProps {
  code: string;
}

const getIsSupported = (config: DashboardItem['config']) => {
  if (config?.type === 'chart') {
    return true;
  }
  if (config?.type === 'view' && config?.viewType) {
    const SUPPORTED_VIEW_TYPES = [
      'singleValue',
      'singleDate',
      'multiValue',
      'multiValueRow',
      'qrCodeVisual',
      'multiPhotograph',
    ];
    return SUPPORTED_VIEW_TYPES.includes(config.viewType);
  }
  return false;
};

export const SelectVisualisation = ({
  onNext,
  onClose,
  selectedDashboardItems,
  setSelectedDashboardItems,
}: SelectVisualisationsProps) => {
  const { activeDashboard } = useDashboard();

  const list =
    activeDashboard?.items?.map(({ config, code }) => {
      const isSupported = getIsSupported(config);
      return {
        name: config?.name,
        code,
        disabled: !isSupported,
        tooltip: !isSupported ? 'PDF export unavailable' : undefined,
      };
    }) ?? [];

  const onChange = (newItems: ListItem[]) => {
    setSelectedDashboardItems(newItems.map(({ code }) => code));
  };

  const selectedItems = list.filter(({ code }) => selectedDashboardItems.includes(code));

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
