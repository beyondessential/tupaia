/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { IconContainer } from '../IconContainer';

export const DownArrow = ({ scale }) => (
  <IconContainer fill="#fa7850" scale={scale} viewBox="0 0 301.13 370.46">
    <path
      d="m1544.6 1703.79c-2.73-2.11-5.72-4-8.14-6.36q-67.23-67.07-134.27-134.32c-2.25-2.27-4.37-5.41-5-8.45-1.37-7.17 4.21-12.87 11.94-12.89h57.16a22 22 0 0 0 5-.54c3.56-.86 5.44-3.38 6-6.89a31.84 31.84 0 0 0 .14-4.69q0-90.81 0-181.6a28.31 28.31 0 0 1 .28-5 11.13 11.13 0 0 1 11.36-9.6q58.61 0 117.21 0c6.86 0 11.4 4.87 11.42 12.15q.06 40.34 0 80.67 0 51.91 0 103.83c0 8.76 3 11.73 11.66 11.73 18.45 0 36.9.07 55.35 0 5.59 0 9.94 1.79 12.35 7 2.22 4.8 1 9.29-3.73 14q-68.29 68.29-136.64 136.55c-1.82 1.81-4.21 3-6.33 4.56z"
      fill="#fa7850"
      transform="translate(-1397.02 -1333.34)"
    />
  </IconContainer>
);

DownArrow.propTypes = {
  scale: PropTypes.number,
};
DownArrow.defaultProps = {
  scale: 1,
};
