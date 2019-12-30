/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * Wrapper for recharts XAxis that dynamically calculates heights based
 * on label heights and supports vertical labels.
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

export default class VerticalTick extends PureComponent {
  componentDidMount() {
    this.props.onHeight(this.getHeight());
  }

  getHeight() {
    const rectangle = this.ref.getBoundingClientRect();

    return rectangle.height;
  }

  render() {
    const { x, y, payload } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={5}
          textAnchor="end"
          fill="#666"
          ref={element => {
            this.ref = element;
          }}
          className="chart-label-text"
          transform="rotate(-90)"
        >
          {payload.value}
        </text>
      </g>
    );
  }
}

VerticalTick.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  payload: PropTypes.shape({ value: PropTypes.number }).isRequired,
  onHeight: PropTypes.func,
};

VerticalTick.defaultProps = {
  onHeight: () => {},
};
