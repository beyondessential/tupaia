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
import { truncate } from '../../../utils/string';

export default class VerticalTick extends PureComponent {
  componentDidMount() {
    this.props.onHeight(this.getHeight());
  }

  getHeight() {
    return 90; // set a fixed height for consistent exporting
  }

  render() {
    const { x, y, payload } = this.props;

    return (
      <foreignObject x={x} y={y} style={{ overflow: 'visible' }}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            position: 'relative',
            wordBreak: 'break-all',
            left: '-6px',
            top: '135px',
            width: '135px',
            color: 'black',
            transform: 'rotate(-90deg)',
            transformOrigin: '0 0',
            fontSize: '12px',
            lineHeight: '1',
          }}
        >
          {truncate(payload.value, 45, true)}
        </div>
      </foreignObject>
    );
  }
}

VerticalTick.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  payload: PropTypes.object.isRequired,
  onHeight: PropTypes.func,
};

VerticalTick.defaultProps = {
  onHeight: () => {},
};
