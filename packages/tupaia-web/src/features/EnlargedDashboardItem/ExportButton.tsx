/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { useContext } from 'react';
import styled from 'styled-components';
import { GetApp } from '@material-ui/icons';
import { IconButton } from '@tupaia/ui-components';
import {
  ACTION_TYPES,
  ExportContext,
  ExportDispatchContext,
  useEnlargedDashboardItem,
} from './utils';
import { useSearchParams } from 'react-router-dom';
import { URL_SEARCH_PARAMS } from '../../constants';

const Button = styled(IconButton).attrs({
  color: 'default',
  title: 'Export visualisation',
})`
  position: absolute;
  top: 0.2rem;
  right: 2.7rem;
  z-index: 1;
`;

export const ExportButton = () => {
  const [urlSearchParams] = useSearchParams();
  const { isExportMode } = useContext(ExportContext);
  const dispatch = useContext(ExportDispatchContext)!;
  const { currentDashboardItem } = useEnlargedDashboardItem();
  const { type } = currentDashboardItem?.config || {};
  const canExport =
    (type === 'chart' || type === 'matrix') &&
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
