import React from 'react';
import { connect } from 'react-redux';
import { selectOrgUnit } from '../../reducers/orgUnitReducers';
import {
  selectRadiusScaleFactor,
  cachedSelectMeasureWithDisplayInfo,
} from '../../reducers/mapReducers';
import { changeOrgUnit } from '../../actions';
import { CircleProportionMarker, IconMarker, MeasurePopup } from '../../components/Marker';

/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */
const MIN_RADIUS = 1;
const MeasureMarker = props => {
  const { coordinates } = props;
  if (!coordinates || coordinates.length < 2) {
    return null;
  }

  if (props.isHidden) {
    return null;
  }

  const popupChild = (
    <MeasurePopup
      data={props}
      measureOptions={props.measureOptions}
      onOrgUnitClick={props.onChangeOrgUnit}
    />
  );

  const { icon, radius } = props;

  if (parseInt(radius, 10) === 0) {
    if (icon) {
      // we have an icon, so don't render the radius at all
      return <IconMarker {...props}>{popupChild}</IconMarker>;
    }

    // we have no icon and zero radius -- use minimum radius instead
    return (
      <CircleProportionMarker {...props} radius={MIN_RADIUS}>
        {popupChild}
      </CircleProportionMarker>
    );
  }

  if (radius && icon) {
    const { markerRef, ...otherProps } = props;
    return (
      <React.Fragment>
        <CircleProportionMarker markerRef={() => null} {...otherProps} />
        <IconMarker {...otherProps} markerRef={markerRef} />
        {popupChild}
      </React.Fragment>
    );
  }
  if (radius) {
    return <CircleProportionMarker {...props}>{popupChild}</CircleProportionMarker>;
  }
  return <IconMarker {...props}>{popupChild}</IconMarker>;
};

const mapStateToProps = (state, ownProps) => {
  const measureOptions = state.map.measureInfo.measureOptions;
  const orgUnit = selectOrgUnit(state, ownProps.organisationUnitCode);
  const coordinates = orgUnit && orgUnit.location ? orgUnit.location.point : [];
  const radiusScaleFactor = selectRadiusScaleFactor(state);
  const measureDataAndDisplayInfo = cachedSelectMeasureWithDisplayInfo(
    state,
    ownProps.organisationUnitCode,
  );
  return {
    ...measureDataAndDisplayInfo,
    ...orgUnit,
    coordinates,
    radiusScaleFactor,
    measureOptions,
  };
};

const mapDispatchToProps = dispatch => ({
  onChangeOrgUnit: (organisationUnit, shouldChangeMapBounds = false) => {
    dispatch(changeOrgUnit(organisationUnit, shouldChangeMapBounds));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(MeasureMarker);
