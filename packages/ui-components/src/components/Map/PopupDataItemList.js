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

export const PopupDataItemList = ({ measureOptions, data, showNoDataLabel }) => {
  const popupList = [];

  if (data) {
    measureOptions
      .filter(measureOption => !measureOption.hideFromPopup)
      .sort((measure1, measure2) => measure1.sortOrder - measure2.sortOrder)
      .forEach(measureOption => {
        const { key, name, organisationUnit, ...otherConfigs } = measureOption;
        const metadata = getMetadata(data, key);
        const { formattedValue, valueInfo } = getFormattedInfo(data, measureOption, {
          key,
          metadata,
          ...otherConfigs,
        });
        if (!valueInfo.hideFromPopup) {
          popupList.push(<PopupDataItem key={name} measureName={name} value={formattedValue} />);
        }
      });
  }

  const { name, key } = measureOptions[0];

  return popupList.length === 0 && showNoDataLabel
    ? [<PopupDataItem key={name || key} measureName={name || key} value="No Data" />]
    : popupList;
};

PopupDataItemList.propTypes = {
  data: PropTypes.object.isRequired,
  measureOptions: PropTypes.arrayOf(
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
