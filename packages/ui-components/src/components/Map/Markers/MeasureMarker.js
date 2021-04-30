/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import { IconMarker } from './IconMarker';
import { CircleProportionMarker } from './CircleProportionMarker';

export const MeasureMarker = React.memo(props => {
  const { icon, radius } = props;

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
        <CircleProportionMarker {...props} />
        <IconMarker {...props} />
      </>
    );
  }

  if (radius) {
    return <CircleProportionMarker {...props} />;
  }

  return <IconMarker {...props} />;
});

MeasureMarker.propTypes = {
  icon: PropTypes.string,
  radius: PropTypes.number,
};

MeasureMarker.defaultProps = {
  icon: null,
  radius: null,
};
