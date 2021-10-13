/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { InteractivePolygon } from '@tupaia/ui-components/lib/map';
import {
  selectHasPolygonMeasure,
  selectMeasuresWithDisplayInfo,
  selectAreRegionLabelsPermanent,
} from '../../selectors';
import { setOrgUnit } from '../../actions';

const Polygon = React.memo(
  ({ measureOrgUnits, measureInfo, onChangeOrgUnit, permanentLabels, ...props }) => {
    const { measureOptions } = measureInfo;

    return (
      <InteractivePolygon
        hasMeasureData={measureOrgUnits && measureOrgUnits.length > 0}
        measureOrgUnits={measureOrgUnits}
        measureOptions={measureOptions}
        permanentLabels={permanentLabels}
        onChangeOrgUnit={onChangeOrgUnit}
        {...props}
      />
    );
  },
);

Polygon.propTypes = {
  measureOrgUnits: PropTypes.array.isRequired,
  measureInfo: PropTypes.object.isRequired,
  onChangeOrgUnit: PropTypes.func,
  permanentLabels: PropTypes.bool,
};

Polygon.defaultProps = {
  permanentLabels: true,
  onChangeOrgUnit: () => {},
};

const mapStateToProps = state => {
  const { measureInfo, displayedMapOverlays } = state.map;

  const measureOrgUnits = selectHasPolygonMeasure(state)
    ? selectMeasuresWithDisplayInfo(state, displayedMapOverlays)
    : [];

  const permanentLabels = selectAreRegionLabelsPermanent(state);

  return {
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
