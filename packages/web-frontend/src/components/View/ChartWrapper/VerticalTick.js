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
    return 80;
    // const rectangle = this.ref.getBoundingClientRect();
    //
    // return rectangle.height;
  }

  render() {
    const { x, y, payload } = this.props;

    return (
      <foreignObject x={x} y={y} style={{ overflow: 'visible' }}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            color: 'black',
            transform: 'rotate(90deg)',
            transformOrigin: '3px 6px',
            width: '120px',
            fontSize: '14px',
            lineHeight: '1',
          }}
        >
          {payload.value}
        </div>
      </foreignObject>
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
