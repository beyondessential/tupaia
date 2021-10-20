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
  const { organisationUnitCode, name } = markerData;
  const replacements = {
    code: organisationUnitCode,
    name,
  };
  return Object.entries(replacements).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, value),
    popupHeaderFormat,
  );
};

export const MeasurePopup = React.memo(({ markerData, serieses, onOrgUnitClick, allSerieses }) => {
  const { coordinates, organisationUnitCode } = markerData;
  const { popupHeaderFormat = '{name}' } = serieses.reduce((all, mo) => ({ ...all, ...mo }), {});
  return (
    <PopupMarker
      headerText={buildHeaderText(markerData, popupHeaderFormat)}
      buttonText="See Dashboard"
      coordinates={coordinates}
      onDetailButtonClick={onOrgUnitClick ? () => onOrgUnitClick(organisationUnitCode) : null}
    >
      <PopupDataItemList
        measureOptions={allSerieses || serieses}
        data={markerData}
        showNoDataLabel
      />
    </PopupMarker>
  );
});

MeasurePopup.propTypes = {
  markerData: PropTypes.shape({
    coordinates: PropTypes.arrayOf(PropTypes.number),
    code: PropTypes.string,
    name: PropTypes.string,
    organisationUnitCode: PropTypes.string,
    photoUrl: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  allMeasureData: PropTypes.object,
  serieses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  allSerieses: PropTypes.array,
  onOrgUnitClick: PropTypes.func,
};

MeasurePopup.defaultProps = {
  onOrgUnitClick: null,
  allMeasureData: null,
  allSerieses: null,
};
