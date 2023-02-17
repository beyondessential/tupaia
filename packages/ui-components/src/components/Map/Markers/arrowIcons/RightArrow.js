/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { IconContainer } from '../IconContainer';

export const RightArrow = ({ scale }) => (
  <IconContainer fill="#fff" scale={scale} viewBox="0 0 370.46 301.13">
    <path
      className="cls-1"
      d="M1732.82,1521.55c-2.11,2.73-4,5.72-6.37,8.14q-67.07,67.23-134.32,134.27a17.86,17.86,0,0,1-8.45,5c-7.16,1.38-12.87-4.2-12.89-11.94,0-19,0-38.1,0-57.16a21.48,21.48,0,0,0-.53-5c-.87-3.56-3.39-5.44-6.89-6a32,32,0,0,0-4.7-.13l-181.6,0a28.2,28.2,0,0,1-5-.28,11.11,11.11,0,0,1-9.6-11.36q-.06-58.6,0-117.2c0-6.87,4.87-11.41,12.15-11.42q40.35-.08,80.68,0H1559c8.76,0,11.73-3,11.73-11.66,0-18.45.07-36.9,0-55.35,0-5.59,1.8-9.94,7-12.35,4.8-2.22,9.29-1,14,3.73q68.29,68.3,136.55,136.64c1.82,1.82,3.06,4.21,4.57,6.33Z"
      transform="translate(-1362.36 -1368)"
    />
  </IconContainer>
);

RightArrow.propTypes = {
  scale: PropTypes.number,
};
RightArrow.defaultProps = {
  scale: 1,
};
