import React from 'react';
import { connect } from 'react-redux';
import { selectOrgUnit } from '../../reducers/orgUnitReducers';
import { CircleProportionMarker, IconMarker } from '../../components/Marker';
import { getMeasureDisplayInfo } from '../../utils';

/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

const MeasureMarker = props => {
  const { coordinates } = props;
  if (!coordinates || coordinates.length < 2) {
    return null;
  }
  const processedProps = getMeasureDisplayInfo(props, props.measureOptions, props.hiddenMeasures);
  const { icon, radius } = processedProps;

  if (processedProps.isHidden) {
    return null;
  }

  processedProps.radiusScaleFactor = calculateRadiusScaleFactor(processedProps);

  if (parseInt(radius, 10) === 0) {
    if (icon) {
      // we have an icon, so don't render the radius at all
      return <IconMarker {...processedProps} />;
    }

    // we have no icon and zero radius -- use minimum radius instead
    return <CircleProportionMarker {...processedProps} radius={MIN_RADIUS} />;
  }

  if (radius && icon) {
    const { markerRef, ...otherProps } = processedProps;
    return (
      <React.Fragment>
        <CircleProportionMarker markerRef={() => null} {...otherProps} />
        <IconMarker {...otherProps} markerRef={markerRef} />
      </React.Fragment>
    );
  }
  if (radius) {
    return <CircleProportionMarker {...processedProps} />;
  }
  return <IconMarker {...processedProps} />;
};

const MIN_RADIUS = 1;
const MAX_ALLOWED_RADIUS = 1000;

const calculateRadiusScaleFactor = processedDataSet => {
  // Check if any of the radii in the dataset are larger than the max allowed
  // radius, and scale everything down proportionally if so.
  // (this needs to happen here instead of inside the circle marker component
  // because it needs to operate on the dataset level, not the datapoint level)
  // const maxRadius = processedDataSet
  //   .map(d => parseInt(d.radius, 10) || 1)
  //   .reduce((state, current) => Math.max(state, current), 0);
  // return maxRadius < MAX_ALLOWED_RADIUS ? 1 : (1 / maxRadius) * MAX_ALLOWED_RADIUS;
  return 10;
};

const mapStateToProps = (state, ownProps) => {
  const orgUnit = selectOrgUnit(ownProps.organisationUnitCode, state.orgUnits);
  const coordinates = orgUnit && orgUnit.location ? orgUnit.location.point : [];
  const {
    measureInfo: { measureOptions, hiddenMeasures },
  } = state.map;
  return { ...orgUnit, coordinates, measureOptions, hiddenMeasures };
};

export default connect(mapStateToProps)(MeasureMarker);
