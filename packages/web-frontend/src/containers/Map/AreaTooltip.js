/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

/**
 * AreaTooltip
 *
 * Wrapper around react-leaflet's tooltip component that allows for updating
 * the opacity without completely re-creating the component.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Tooltip } from 'react-leaflet';

import { HIGHLIGHT_TYPES } from './constants';

export class AreaTooltip extends Component {
  constructor(props) {
    super(props);
    this.ref = null;
  }

  componentDidMount() {
    const { leafletElement } = this.ref;
    if (leafletElement) {
      // componentDidMount will get called before leaflet has fully finished
      // calculating the map layout (and it appears the same is true for the
      // native leafletElement `add` event), so call `update` after a tiny delay
      // to ensure the tooltip lands in the correct position.
      setTimeout(() => leafletElement.update(), 10);
    }
  }

  componentDidUpdate(prevProps) {
    // Some parameters cannot be updated just through props changes once
    // the component has been rendered due to a limitation in react-leaflet.
    // So, we grab a ref to the leaflet element and update it here.

    if (prevProps.highlight !== this.props.highlight) {
      this.ref.leafletElement.setOpacity(this.getOpacity());
    }
  }

  getOpacity() {
    return this.props.highlight === HIGHLIGHT_TYPES.LOWLIGHT ? 0.7 : 1;
  }

  render() {
    const { permanent, onMouseOver, onMouseOut, text } = this.props;

    return (
      <Tooltip
        pane="tooltipPane"
        direction="auto"
        opacity={this.getOpacity()}
        permanent={permanent}
        interactive={permanent}
        onMouseOver={onMouseOver}
        onFocus={onMouseOver}
        onMouseOut={onMouseOut}
        onBlur={onMouseOut}
        ref={r => {
          this.ref = r;
        }}
      >
        <span>{text}</span>
      </Tooltip>
    );
  }
}

AreaTooltip.propTypes = {
  highlight: PropTypes.oneOf(Object.values(HIGHLIGHT_TYPES)),
  permanent: PropTypes.bool,
  text: PropTypes.string.isRequired,
  onMouseOver: PropTypes.func,
  onMouseOut: PropTypes.func,
};

AreaTooltip.defaultProps = {
  highlight: 'none',
  permanent: false,
  onMouseOver: undefined,
  onMouseOut: undefined,
};
