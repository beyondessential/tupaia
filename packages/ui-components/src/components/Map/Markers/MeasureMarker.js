/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { IconMarker } from './IconMarker';
import { CircleProportionMarker } from './CircleProportionMarker';

export const MeasureMarker = props => {
  const { icon, radius, displayPolygons } = props;

  if (displayPolygons) {
    return <IconMarker {...props} />;
  }

  if (parseInt(radius, 10) === 0) {
    if (icon) {
      // we have an icon, so don't render the radius at all
      return <IconMarker {...props} />;
    }

    // we have no icon and zero radius -- use minimum radius instead
    return <CircleProportionMarker {...props} radius="1" />;
  }

  if (radius && icon) {
    return (
      <>
        <CircleProportionMarker markerRef={() => null} {...props} />
        <IconMarker {...props} />
      </>
    );
  }

  if (radius) {
    return <CircleProportionMarker {...props} />;
  }
  return <IconMarker {...props} />;
};

MeasureMarker.propTypes = {
  icon: PropTypes.string.isRequired,
  radius: PropTypes.string.isRequired,
  region: PropTypes.string.isRequired,
  displayPolygons: PropTypes.string.isRequired,
};
