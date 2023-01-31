/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { IconContainer } from '../IconContainer';

export const UpArrow = ({ scale }) => (
  <IconContainer fill="#fa7850" scale={scale} viewBox="0 0 301.13 370.46">
    <path
      d="m1550.58 1333.34c2.72 2.1 5.71 4 8.13 6.36q67.23 67.07 134.29 134.3c2.26 2.27 4.38 5.41 5 8.45 1.38 7.17-4.2 12.87-11.93 12.89-19.06.05-38.11 0-57.16 0a21.93 21.93 0 0 0 -5 .54c-3.56.86-5.45 3.38-6 6.89a30.48 30.48 0 0 0 -.14 4.69q0 90.8 0 181.6a29.16 29.16 0 0 1 -.27 5 11.12 11.12 0 0 1 -11.36 9.6q-58.61.06-117.21 0c-6.87 0-11.41-4.87-11.42-12.15q-.08-40.33 0-80.68v-103.72c0-8.76-3-11.73-11.67-11.73-18.45 0-36.9-.07-55.35 0-5.59 0-9.93-1.79-12.34-7-2.22-4.8-1-9.29 3.72-14q68.3-68.29 136.64-136.55c1.82-1.82 4.21-3.06 6.34-4.56z"
      fill="#00a1fb"
      transform="translate(-1397.02 -1333.34)"
    />
  </IconContainer>
);

UpArrow.propTypes = {
  scale: PropTypes.number,
};
UpArrow.defaultProps = {
  scale: 1,
};
