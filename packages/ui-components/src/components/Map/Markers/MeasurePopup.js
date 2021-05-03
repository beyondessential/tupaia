/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { getFormattedInfo } from '../utils';
import { PopupMarker } from './PopupMarker';

const buildHeaderText = (measureData, popupHeaderFormat) => {
  const { code, name } = measureData;
  const replacements = {
    code,
    name,
  };
  return Object.entries(replacements).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, value),
    popupHeaderFormat,
  );
};

export const MeasurePopup = React.memo(({ measureData, serieses }) => {
  const { coordinates } = measureData;
  const { popupHeaderFormat = '{name}' } = serieses.reduce((all, mo) => ({ ...all, ...mo }), {});
  return (
    <PopupMarker
      headerText={buildHeaderText(measureData, popupHeaderFormat)}
      coordinates={coordinates}
    >
      {serieses
        .filter(series => !series.hideFromPopup)
        .map(series => {
          const { key, name } = series;
          const { formattedValue, valueInfo } = getFormattedInfo(measureData, series);

          return valueInfo.hideFromPopup ? null : (
            <div key={key}>
              <span>{`${name}: `}</span>
              <strong>{formattedValue}</strong>
            </div>
          );
        })}
    </PopupMarker>
  );
});

MeasurePopup.propTypes = {
  measureData: PropTypes.shape({
    coordinates: PropTypes.arrayOf(PropTypes.number),
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    photoUrl: PropTypes.string,
    organisationUnitCode: PropTypes.string,
    name: PropTypes.string,
  }).isRequired,
  serieses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
};
