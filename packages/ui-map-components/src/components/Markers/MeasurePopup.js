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

export const MeasurePopup = React.memo(
  ({ markerData, serieses, onSeeOrgUnitDashboard, multiOverlaySerieses }) => {
    const { coordinates, organisationUnitCode } = markerData;
    const { popupHeaderFormat = '{name}' } = serieses.reduce((all, mo) => ({ ...all, ...mo }), {});
    return (
      <PopupMarker
        headerText={buildHeaderText(markerData, popupHeaderFormat)}
        buttonText="See Dashboard"
        coordinates={coordinates}
        onDetailButtonClick={
          onSeeOrgUnitDashboard ? () => onSeeOrgUnitDashboard(organisationUnitCode) : null
        }
      >
        <PopupDataItemList serieses={multiOverlaySerieses || serieses} data={markerData} />
      </PopupMarker>
    );
  },
);

MeasurePopup.propTypes = {
  markerData: PropTypes.shape({
    coordinates: PropTypes.arrayOf(PropTypes.number),
    code: PropTypes.string,
    name: PropTypes.string,
    organisationUnitCode: PropTypes.string,
    photoUrl: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  serieses: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  multiOverlaySerieses: PropTypes.array,
  onSeeOrgUnitDashboard: PropTypes.func,
};

MeasurePopup.defaultProps = {
  onSeeOrgUnitDashboard: null,
  multiOverlaySerieses: null,
};
