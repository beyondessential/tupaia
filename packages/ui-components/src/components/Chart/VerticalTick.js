/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/**
 * Wrapper for recharts XAxis that dynamically calculates heights based
 * on label heights and supports vertical labels.
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

const truncate = (str, num, ellipsis = false) => {
  if (str.length <= num) {
    return str;
  }
  return ellipsis ? `${str.slice(0, num)}...` : str.slice(0, num);
};

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
            textAlign: 'right',
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
