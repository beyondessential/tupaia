/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { getFormattedInfo } from './utils';

const getMetadata = (data, key) => {
  if (data.metadata) {
    return data.metadata;
  }
  const metadataKeys = Object.keys(data).filter(k => k.includes(`${key}_metadata`));
  return Object.fromEntries(metadataKeys.map(k => [k.replace(`${key}_metadata`, ''), data[k]]));
};

const PopupDataItem = ({ measureName, value }) => (
  <div key={measureName}>
    <span>{`${measureName}: `}</span>
    <strong>{value}</strong>
  </div>
);

PopupDataItem.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  measureName: PropTypes.string.isRequired,
};

export const PopupDataItemList = ({ serieses, data, showNoDataLabel }) => {
  const popupList = data
    ? serieses
        .filter(series => !series.hideFromPopup)
        .sort((measure1, measure2) => measure1.sortOrder - measure2.sortOrder)
        .map(series => {
          const { key, name, organisationUnit, ...otherConfigs } = series;
          const metadata = getMetadata(data, key);
          const { formattedValue, valueInfo } = getFormattedInfo(data, series, {
            key,
            metadata,
            ...otherConfigs,
          });
          return valueInfo.hideFromPopup ? null : (
            <PopupDataItem key={name} measureName={name} value={formattedValue} />
          );
        })
        .filter(popupItem => popupItem !== null)
    : [];

  const noDataLabels = serieses.map(({ name, key }) => (
    <PopupDataItem key={name || key} measureName={name || key} value="No Data" />
  ));

  return popupList.length === 0 && showNoDataLabel ? noDataLabels : popupList;
};

PopupDataItemList.propTypes = {
  data: PropTypes.object,
  serieses: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      name: PropTypes.string,
      hideFromPopup: PropTypes.bool,
      metadata: PropTypes.object,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  showNoDataLabel: PropTypes.bool,
};

PopupDataItemList.defaultTypes = { data: null };
