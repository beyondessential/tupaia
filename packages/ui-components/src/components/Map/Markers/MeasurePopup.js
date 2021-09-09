/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { PopupDataItemList } from '../PopupDataItemList';
import { PopupMarker } from './PopupMarker';

const buildHeaderText = (markerData, popupHeaderFormat) => {
  const { code, name } = markerData;
  const replacements = {
    code,
    name,
  };
  return Object.entries(replacements).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, value),
    popupHeaderFormat,
  );
};

export const MeasurePopup = React.memo(({ markerData, serieses }) => {
  const { coordinates } = markerData;
  const { popupHeaderFormat = '{name}' } = serieses.reduce((all, mo) => ({ ...all, ...mo }), {});
  return (
    <PopupMarker
      headerText={buildHeaderText(markerData, popupHeaderFormat)}
      coordinates={coordinates}
    >
      <PopupDataItemList measureOptions={serieses} data={markerData} />
    </PopupMarker>
  );
});

MeasurePopup.propTypes = {
  markerData: PropTypes.shape({
    coordinates: PropTypes.arrayOf(PropTypes.number),
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    photoUrl: PropTypes.string,
    code: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  serieses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
};
