/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { InteractivePolygon } from '@tupaia/ui-components/lib/map';
import {
  selectHasPolygonMeasure,
  selectAllMeasuresWithDisplayInfo,
  selectRenderedMeasuresWithDisplayInfo,
  selectAreRegionLabelsPermanent,
} from '../../selectors';
import { setOrgUnit } from '../../actions';

const Polygon = React.memo(
  ({ measureData, measureOrgUnits, measureInfo, onChangeOrgUnit, permanentLabels, ...props }) => {
    const { measureOptions } = measureInfo;

    return (
      <InteractivePolygon
        hasMeasureData={measureData && measureData.length > 0}
        measureOptions={measureOptions}
        measureOrgUnits={measureOrgUnits}
        permanentLabels={permanentLabels}
        onChangeOrgUnit={onChangeOrgUnit}
        {...props}
      />
    );
  },
);

Polygon.propTypes = {
  measureData: PropTypes.array.isRequired,
  measureOrgUnits: PropTypes.array.isRequired,
  measureInfo: PropTypes.object.isRequired,
  mapOverlayId: PropTypes.string,
  onChangeOrgUnit: PropTypes.func,
  permanentLabels: PropTypes.bool,
};

Polygon.defaultProps = {
  permanentLabels: true,
  mapOverlayId: null,
  onChangeOrgUnit: () => {},
};

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
  const permanentLabels = selectAreRegionLabelsPermanent(state);

  return {
    measureData,
    measureOrgUnits,
    measureInfo,
    permanentLabels,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
});

export const ConnectedPolygon = connect(mapStateToProps, mapDispatchToProps)(Polygon);
