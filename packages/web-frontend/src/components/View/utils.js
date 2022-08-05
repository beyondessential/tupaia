/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { VIEW_STYLES } from '../../styles';
import { ChartWrapper } from './ChartWrapper';
import { ColorListWrapper } from './ColorListWrapper';
import { DataDownloadWrapper } from './DataDownloadWrapper';
import { ListWrapper } from './ListWrapper';
import { MatrixWrapper } from './MatrixWrapper';
import { MultiPhotoWrapper } from './MultiPhotoWrapper';
import { MultiSingleValueWrapper } from './MultiSingleValueWrapper';
import { MultiValueRowWrapper } from './MultiValueRowWrapper';
import { MultiValueWrapper } from './MultiValueWrapper';
import { SingleComparisonWrapper } from './SingleComparisonWrapper';
import { SingleDateWrapper } from './SingleDateWrapper';
import { SingleDownloadLinkWrapper } from './SingleDownloadLinkWrapper';
import { SingleTickWrapper } from './SingleTickWrapper';
import { SingleValueWrapper } from './SingleValueWrapper';
import { ViewTitle } from './Typography';

const SINGLE_VALUE_COMPONENTS = {
  singleTick: SingleTickWrapper,
  singleValue: SingleValueWrapper,
  singleDate: SingleDateWrapper,
  singleDownloadLink: SingleDownloadLinkWrapper,
  singleComparison: SingleComparisonWrapper,
};

const VIEW_TYPES = {
  dataDownload: DataDownloadWrapper,
  multiValue: MultiValueWrapper,
  multiValueRow: MultiValueRowWrapper,
  multiPhotograph: MultiPhotoWrapper,
  multiSingleValue: MultiSingleValueWrapper,
  list: ListWrapper,
  colorList: ColorListWrapper,
  ...SINGLE_VALUE_COMPONENTS,
};

export function getViewWrapper({ type, viewType }) {
  switch (type) {
    case 'chart':
      return ChartWrapper;
    case 'matrix':
      return MatrixWrapper;
    case 'view':
    default: {
      const ViewWrapper = VIEW_TYPES[viewType];
      if (!ViewWrapper) {
        return (
          <div style={VIEW_STYLES.newChartComing}>
            <ViewTitle>New dashboard element coming soon</ViewTitle>
          </div>
        );
      }
      return ViewWrapper;
    }
  }
}

export function getExportViewWrapper({ type, viewType }) {
  switch (type) {
    case 'chart':
      return ChartWrapper;
    default: {
      return (
        <div style={VIEW_STYLES.newChartComing}>
          <ViewTitle>{`'${type || viewType}' type visual does not support PDF export`}</ViewTitle>
        </div>
      );
    }
  }
}

export function getIsSingleValue({ viewType }) {
  return Object.keys(SINGLE_VALUE_COMPONENTS).includes(viewType);
}

export function getIsMatrix(viewContent) {
  return viewContent && viewContent.type === 'matrix';
}

export function getIsDataDownload(viewContent) {
  return viewContent && viewContent.viewType === 'dataDownload';
}

export function checkIfApplyDotStyle(presentationOptions) {
  return presentationOptions?.applyLocation?.columnIndexes;
}

export function getIsUsingDots(presentationOptions) {
  return Object.keys(presentationOptions).length > 0;
}

export const transformDataForViewType = viewContent => {
  if (
    getIsSingleValue(viewContent) &&
    typeof viewContent.data === 'object' &&
    typeof viewContent.data[0] === 'object'
  ) {
    const newViewContent = {
      ...viewContent.data[0],
      ...viewContent,
    };
    delete newViewContent.data;
    return newViewContent;
  }

  return viewContent;
};
