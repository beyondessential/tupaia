import React, { useContext } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { GetApp } from '@material-ui/icons';
import { IconButton } from '@tupaia/ui-components';
import { URL_SEARCH_PARAMS, DashboardItemVizTypes, ViewVizTypes } from '../../constants';
import { ExportDashboardItemContext, useEnlargedDashboardItem } from './utils';
import { CircularProgress } from '@material-ui/core';

const Button = styled(IconButton).attrs({
  color: 'default',
})`
  position: absolute;
  top: 0.2rem;
  right: 2.7rem;
  z-index: 1;
  svg {
    color: ${({ theme }) => theme.palette.text.primary};
  }
`;

export const ExportIconButton = ({
  onClick,
  title = 'Export visualisation',
  isLoading = false,
}: {
  onClick: () => void;
  title?: string;
  isLoading?: boolean;
}) => {
  return (
    <Button onClick={onClick} title={title} disabled={isLoading}>
      {isLoading ? <CircularProgress size="1.2rem" /> : <GetApp />}
    </Button>
  );
};

const EXPORTABLE_TYPES = [
  DashboardItemVizTypes.Chart,
  DashboardItemVizTypes.Matrix,
  ViewVizTypes.MultiValue,
];

export const ExportButton = () => {
  const [urlSearchParams] = useSearchParams();
  const { isExportMode, setIsExportMode } = useContext(ExportDashboardItemContext);
  const { currentDashboardItem } = useEnlargedDashboardItem();
  const getDisplayType = () => {
    if (!currentDashboardItem?.config) return null;
    const { config } = currentDashboardItem;
    if (config.type === 'view') {
      const { viewType } = config;
      return viewType;
    }
    return config.type;
  };
  const displayType = getDisplayType();

  // Only show export button if the current dashboard item is a chart, matrix or multi-value view AND it is not a drilldown
  const canExport =
    displayType &&
    EXPORTABLE_TYPES.includes(displayType) &&
    !urlSearchParams.get(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);

  const onClickExportButton = () => {
    setIsExportMode(true);
  };

  if (!canExport || isExportMode) return null;

  return <ExportIconButton onClick={onClickExportButton} />;
};
