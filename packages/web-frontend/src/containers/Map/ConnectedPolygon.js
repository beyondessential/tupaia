/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { InteractivePolygon } from './UIComponents/InteractivePolygon';
import {
  selectHasPolygonMeasure,
  selectAllMeasuresWithDisplayInfo,
  selectRenderedMeasuresWithDisplayInfo,
  selectCurrentMeasureId,
  selectAreRegionLabelsPermanent,
} from '../../selectors';
import { setOrgUnit } from '../../actions';

const Polygon = React.memo(
  ({
    measureData,
    measureOrgUnits,
    measureInfo,
    measureId,
    setOrgUnit,
    permanentLabels,
    ...props
  }) => {
    const { measureOptions } = measureInfo;

    return (
      <InteractivePolygon
        hasMeasureData={measureData && measureData.length > 0}
        measureOptions={measureOptions}
        measureId={measureId}
        measureOrgUnits={measureOrgUnits}
        permanentLabels={permanentLabels}
        onChangeOrgUnit={setOrgUnit}
        {...props}
      />
    );
  },
);

const selectMeasureDataWithCoordinates = createSelector([measureData => measureData], measureData =>
  measureData.map(({ location, ...otherData }) => ({
    ...otherData,
    coordinates: location && location.point,
    region: location && location.region,
  })),
);

const mapStateToProps = state => {
  const { measureInfo } = state.map;

  const measureOrgUnits = selectHasPolygonMeasure(state)
    ? selectAllMeasuresWithDisplayInfo(state)
    : [];
  const measureData = selectMeasureDataWithCoordinates(
    selectRenderedMeasuresWithDisplayInfo(state),
  );
  const measureId = selectCurrentMeasureId(state);
  const permanentLabels = selectAreRegionLabelsPermanent(state);

  return {
    measureData,
    measureOrgUnits,
    measureInfo,
    measureId,
    permanentLabels,
  };
};

const mapDispatchToProps = dispatch => ({
  setOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
});

export const ConnectedPolygon = connect(mapStateToProps, mapDispatchToProps)(Polygon);
