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

export const getViewWrapper = ({ type, viewType }) => {
  switch (type) {
    case 'chart':
      return ChartWrapper;
    case 'matrix':
      return MatrixWrapper;
    default:
    case 'view': {
      console.log(type, viewType);
      const ViewWrapper = VIEW_TYPES[viewType];
      if (!ViewWrapper) {
        console.log('type, viewType');
        return (
          <div style={VIEW_STYLES.newChartComing}>
            <h2 style={VIEW_STYLES.title}>New dashboard element coming soon</h2>
          </div>
        );
      }
      return ViewWrapper;
    }
  }
};

export const getIsSingleValue = ({ viewType }) => {
  return Object.keys(SINGLE_VALUE_COMPONENTS).includes(viewType);
};

export const getIsMatrix = viewContent => {
  return viewContent && viewContent.type === 'matrix';
};

export const getIsDataDownload = viewContent => {
  return viewContent && viewContent.viewType === 'dataDownload';
};
