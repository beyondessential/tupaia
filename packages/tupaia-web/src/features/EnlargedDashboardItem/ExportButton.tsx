/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { GetApp } from '@material-ui/icons';
import { IconButton } from '@tupaia/ui-components';
import { URL_SEARCH_PARAMS, DashboardItemVizTypes, ViewVizTypes } from '../../constants';
import {
  ACTION_TYPES,
  ExportContext,
  ExportDispatchContext,
  useEnlargedDashboardItem,
} from './utils';

const Button = styled(IconButton).attrs({
  color: 'default',
  title: 'Export visualisation',
})`
  position: absolute;
  top: 0.2rem;
  right: 2.7rem;
  z-index: 1;
`;

const EXPORTABLE_TYPES = [
  DashboardItemVizTypes.Chart,
  DashboardItemVizTypes.Matrix,
  ViewVizTypes.MultiValue,
];

export const ExportButton = () => {
  const [urlSearchParams] = useSearchParams();
  const { isExportMode } = useContext(ExportContext);
  const dispatch = useContext(ExportDispatchContext)!;
  const { currentDashboardItem } = useEnlargedDashboardItem();
  const { type, viewType } = currentDashboardItem?.config || {};
  const displayType = viewType || type;

  // Only show export button if the current dashboard item is a chart, matrix or multi-value view AND it is not a drilldown
  const canExport =
    EXPORTABLE_TYPES.includes(displayType) &&
    !urlSearchParams.get(URL_SEARCH_PARAMS.REPORT_DRILLDOWN_ID);

  const onClickExportButton = () => {
    dispatch({
      type: ACTION_TYPES.SET_IS_EXPORT_MODE,
      payload: true,
    });
  };

  if (!canExport || isExportMode) return null;

  return (
    <Button onClick={onClickExportButton}>
      <GetApp />
    </Button>
  );
};
