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
  selectCurrentMapOverlayCodes,
} from '../../selectors';
import { setOrgUnit } from '../../actions';
import { selectMeasureOptions } from '../../selectors/measureSelectors';

const Polygon = React.memo(
  ({ measureOrgUnits, measureOptions, onChangeOrgUnit, permanentLabels, ...props }) => {
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
  measureOptions: PropTypes.array.isRequired,
  onChangeOrgUnit: PropTypes.func,
  permanentLabels: PropTypes.bool,
};

Polygon.defaultProps = {
  permanentLabels: true,
  onChangeOrgUnit: () => {},
};

const mapStateToProps = state => {
  const { displayedMapOverlays } = state.map;
  const currentMapOverlayCodes = selectCurrentMapOverlayCodes(state);
  const measureOptions = selectMeasureOptions(state, currentMapOverlayCodes) || [];
  const measureOrgUnits = selectHasPolygonMeasure(state)
    ? selectMeasuresWithDisplayInfo(state, displayedMapOverlays)
    : [];
  const permanentLabels = selectAreRegionLabelsPermanent(state);

  return {
    measureOrgUnits,
    measureOptions,
    permanentLabels,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnitCode, shouldChangeMapBounds = true) => {
    dispatch(setOrgUnit(organisationUnitCode, shouldChangeMapBounds));
  },
});

export const ConnectedPolygon = connect(mapStateToProps, mapDispatchToProps)(Polygon);
